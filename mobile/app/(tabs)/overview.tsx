// @ts-nocheck
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetScrollView, 
  BottomSheetTextInput, 
  BottomSheetBackdrop 
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckCircle2,
  X,
  Trash2,
  Filter,
  AlertCircle,
  Pin,
  Archive,
  ArchiveRestore,
  Edit3,
  Clock
} from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { trpc } from '../../utils/trpc';

const { width } = Dimensions.get('window');
const NAVY = '#111827';
const SOFT_BG = '#f6f5f3';
const CORAL = '#e87a6e';

export default function NotesScreen() {
  const [search, setSearch] = useState('');
  
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  const addModalRef = useRef(null);
  const detailModalRef = useRef(null);
  const filterModalRef = useRef(null);
  const snapPoints = useMemo(() => ['100%'], []);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  
  const [sortOrder, setSortOrder] = useState('Newest');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Use tRPC to fetch ALL notes
  const { data: notes, isLoading, refetch, isRefetching } = trpc.note.getNotes.useQuery();

  const processedNotes = useMemo(() => {
    if (!notes) return [];
    let result = [...notes];
    
    if (search.trim()) {
       const q = search.toLowerCase();
       result = result.filter(n => 
         (n.title && n.title.toLowerCase().includes(q)) || 
         (n.plainText && n.plainText.toLowerCase().includes(q))
       );
    }

    if (!search.trim() && !showArchived) {
      result = result.filter(n => !n.isArchived);
    }
    
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortOrder === 'Newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'Oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === 'A-Z') {
        return (a.title || 'Untitled Log').localeCompare(b.title || 'Untitled Log');
      } else if (sortOrder === 'Z-A') {
        return (b.title || 'Untitled Log').localeCompare(a.title || 'Untitled Log');
      }
      return 0;
    });
    return result;
  }, [notes, search, sortOrder, showArchived]);

  const createNoteMutation = trpc.note.createNote.useMutation({
    onSuccess: () => {
      refetch();
      addModalRef.current?.dismiss();
      setAddModalVisible(false);
      setNewTitle('');
      setNewDesc('');
    }
  });

  const updateNoteMutation = trpc.note.updateNote.useMutation({
    onSuccess: () => {
      refetch();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  });

  const deleteNoteMutation = trpc.note.deleteNote.useMutation({
    onSuccess: () => {
      refetch();
      detailModalRef.current?.dismiss();
      setDetailModalVisible(false);
      setShowDeleteConfirm(false);
    }
  });

  useEffect(() => {
    if (!selectedNote || !isDetailModalVisible) return;
    
    const timeoutId = setTimeout(() => {
      if (selectedNote.title?.trim() !== '' || selectedNote.plainText?.trim() !== '') {
         setSaveStatus('saving');
         updateNoteMutation.mutate({
           id: selectedNote.id,
           title: selectedNote.title,
           plainText: selectedNote.plainText,
         });
      }
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [selectedNote?.title, selectedNote?.plainText]);

  const handleCreateNote = () => {
    if (!newDesc.trim() && !newTitle.trim()) return;
    createNoteMutation.mutate({
      title: newTitle.trim() || 'Untitled Log',
      plainText: newDesc.trim() || undefined,
    });
  };

  const handleTogglePin = () => {
    if (!selectedNote) return;
    const upd = { ...selectedNote, isPinned: !selectedNote.isPinned };
    setSelectedNote(upd);
    setSaveStatus('saving');
    updateNoteMutation.mutate({ id: upd.id, isPinned: upd.isPinned });
  };

  const handleToggleArchive = () => {
    if (!selectedNote) return;
    const upd = { ...selectedNote, isArchived: !selectedNote.isArchived };
    setSelectedNote(upd);
    setSaveStatus('saving');
    updateNoteMutation.mutate({ id: upd.id, isArchived: upd.isArchived });
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
  );

  const todayText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const isError = createNoteMutation.isError || updateNoteMutation.isError || deleteNoteMutation.isError; // This is for mutations, but we want query error too
  const queryError = trpc.note.getNotes.useQuery().isError;

  if (isLoading && !isRefetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f5f3' }}>
        <ActivityIndicator size="large" color={NAVY} />
        <Text style={{ marginTop: 16, color: '#64748b', fontWeight: '500' }}>Opening your logs...</Text>
      </View>
    );
  }

  if (queryError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f6f5f3', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertCircle color="#ef4444" size={28} />
        </View>
        <Text style={{ color: NAVY, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>Failed to load logs</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: NAVY, borderRadius: 16 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (processedNotes.length === 0 && !isLoading && !isRefetching && search === '') {
     // Optional: handle empty state specifically if needed
  }

  return (
    <View style={{ flex: 1, backgroundColor: SOFT_BG }}>
      <StatusBar style="dark" />
      
      <View style={{ px: 24, pt: 64, pb: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, paddingHorizontal: 24 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{todayText}</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: -1 }}>Logs</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { setAddModalVisible(true); addModalRef.current?.present(); }}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 8, marginHorizontal: 24 }}>
          <Search size={18} color="#94a3b8" />
          <TextInput 
            style={{ flex: 1, marginLeft: 12, fontSize: 15, fontWeight: 'bold', color: NAVY }}
            placeholder="Search logs..."
            placeholderTextColor="#cbd5e1"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity onPress={() => setSortModalVisible(true)} style={{ marginLeft: 12, borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 12 }}>
             <Filter size={18} color={sortOrder !== 'Newest' ? CORAL : NAVY} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowArchived(!showArchived)} style={{ marginLeft: 12, borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 12 }}>
             <Archive size={18} color={showArchived ? CORAL : NAVY} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={NAVY} />}
      >
        <View style={{ marginTop: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            {search.length > 0 ? 'Search Results' : 'Recent Entries'}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>{processedNotes.length} Total</Text>
        </View>

        {processedNotes.length === 0 ? (
          <View style={{ marginTop: 80, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
            <FileText size={48} color="#cbd5e1" />
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#cbd5e1', textAlign: 'center', marginTop: 32 }}>Empty Log</Text>
          </View>
        ) : (
          processedNotes.map((note) => (
            <NoteItem 
              key={note.id} 
              note={note} 
              onPress={() => {
                setSelectedNote(note);
                setShowDeleteConfirm(false);
                setIsEditingMode(false);
                setDetailModalVisible(true);
                detailModalRef.current?.present();
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Add Log Modal */}
      <BottomSheetModal
        ref={addModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }}
        backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }}
        onChange={(i) => { if (i === -1) setAddModalVisible(false); }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16, paddingBottom: 56 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY }}>Draft Log</Text>
            <TouchableOpacity onPress={() => addModalRef.current?.dismiss()} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color={NAVY} />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 }}>Title / Subject</Text>
              <BottomSheetTextInput
                placeholder="Capture the subject..."
                placeholderTextColor="#cbd5e1"
                style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 15, fontWeight: 'bold', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9' }}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 }}>Log Content</Text>
              <BottomSheetTextInput
                placeholder="Write documentation..."
                placeholderTextColor="#cbd5e1"
                multiline
                style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 14, fontWeight: 'medium', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', minHeight: 150 }}
                value={newDesc}
                onChangeText={setNewDesc}
                textAlignVertical="top"
              />
            </View>
          </BottomSheetScrollView>

          <TouchableOpacity
            onPress={handleCreateNote}
            disabled={(!newDesc.trim() && !newTitle.trim()) || createNoteMutation.isPending}
            style={[{ py: 16, borderRadius: 16, alignItems: 'center', backgroundColor: NAVY }, (!newDesc.trim() && !newTitle.trim()) && { backgroundColor: '#f1f5f9' }]}
          >
            {createNoteMutation.isPending ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Entry</Text>}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Detail Modal */}
      <BottomSheetModal
        ref={detailModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }}
        backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }}
        onChange={(i) => { if (i === -1) setDetailModalVisible(false); }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16, paddingBottom: 56 }}>
          {selectedNote && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY, maxWidth: '60%' }} numberOfLines={1}>{selectedNote.title || 'Log Entry'}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleTogglePin} style={[{ p: 8, borderRadius: 12 }, selectedNote.isPinned ? { backgroundColor: '#fef3c7' } : { backgroundColor: '#f8fafc' }]}>
                    <Pin size={16} color={selectedNote.isPinned ? '#d97706' : '#94a3b8'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => detailModalRef.current?.dismiss()} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} color={NAVY} />
                  </TouchableOpacity>
                </View>
              </View>

              <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                <BottomSheetTextInput
                  style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 15, fontWeight: 'bold', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}
                  value={selectedNote.title || ''}
                  onChangeText={(t) => setSelectedNote({...selectedNote, title: t})}
                />
                
                <View style={{ marginBottom: 24 }}>
                  <TouchableOpacity onPress={() => setIsEditingMode(!isEditingMode)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    {isEditingMode ? <FileText size={12} color={NAVY} /> : <Edit3 size={12} color={NAVY} />}
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: NAVY, marginLeft: 4 }}>{isEditingMode ? 'PREVIEW' : 'EDIT MARKDOWN'}</Text>
                  </TouchableOpacity>
                  
                  {isEditingMode ? (
                    <BottomSheetTextInput
                      multiline
                      style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 14, fontWeight: 'medium', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', minHeight: 250 }}
                      value={selectedNote.plainText || ''}
                      onChangeText={(t) => setSelectedNote({...selectedNote, plainText: t})}
                      textAlignVertical="top"
                    />
                  ) : (
                    <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWith: 1, borderColor: '#f1f5f9', minHeight: 250 }}>
                       <Markdown style={{ body: { color: NAVY, fontSize: 15, lineHeight: 24 } }}>{selectedNote.plainText || ''}</Markdown>
                    </View>
                  )}
                </View>
              </BottomSheetScrollView>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {saveStatus === 'saving' ? <ActivityIndicator size="small" color="#94a3b8" /> : (saveStatus === 'saved' ? <CheckCircle2 size={16} color="#10b981" /> : <Clock size={16} color="#cbd5e1" />)}
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8', marginLeft: 8 }}>{saveStatus === 'saving' ? 'Saving...' : (saveStatus === 'saved' ? 'Saved' : 'Auto-saved')}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={{ p: 8 }}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {showDeleteConfirm && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', padding: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 40 }}>
              <AlertCircle size={48} color="#ef4444" />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY, marginTop: 16 }}>Delete Log?</Text>
              <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8, marginBottom: 32 }}>This cannot be undone.</Text>
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#64748b' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteNoteMutation.mutate({ id: selectedNote.id })} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: CORAL, alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: 'white' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>

      {/* Sort Modal */}
      <BottomSheetModal
        ref={filterModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }}
        backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }}
        onChange={(i) => { if (i === -1) setSortModalVisible(false); }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16, paddingBottom: 56 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY }}>Sort Logs</Text>
             <TouchableOpacity onPress={() => filterModalRef.current?.dismiss()} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
               <X size={18} color={NAVY} />
             </TouchableOpacity>
          </View>
          
          <View style={{ gap: 12 }}>
            {['Newest', 'Oldest', 'A-Z', 'Z-A'].map(option => (
              <TouchableOpacity 
                key={option}
                onPress={() => { setSortOrder(option); filterModalRef.current?.dismiss(); }}
                style={[{ padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }, sortOrder === option && { backgroundColor: '#f8fafc', borderColor: NAVY }]}
              >
                <Text style={[{ fontSize: 16, fontWeight: 'bold', color: '#94a3b8' }, sortOrder === option && { color: NAVY }]}>{option}</Text>
                {sortOrder === option && <CheckCircle2 size={20} color={NAVY} />}
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

function NoteItem({ note, onPress }) {
  const dateStr = new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{ backgroundColor: 'white', borderRadius: 24, p: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, padding: 20 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {note.isPinned && <Pin size={14} color="#d97706" style={{ marginRight: 8 }} />}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: NAVY }} numberOfLines={1}>
            {note.title || 'Untitled Log'}
          </Text>
        </View>
      </View>
      
      <Text style={{ fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 16, paddingHorizontal: 20 }} numberOfLines={2}>
        {note.plainText || 'No content provided.'}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', pt: 12, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 }}>
          <Clock size={11} color="#64748b" />
          <Text style={{ fontSize: 10, color: '#64748b', marginLeft: 6, fontWeight: 'bold', textTransform: 'uppercase' }}>{dateStr}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
