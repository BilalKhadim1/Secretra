const fs = require('fs');
let content = fs.readFileSync('app/(tabs)/overview.tsx', 'utf8');

content = content.replace(
  /import \{([^}]*)\} from 'react-native';/,
  "import {\} from 'react-native';\nimport { BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';"
);

const refsCode = "  const addModalRef = useRef(null);\n  const detailModalRef = useRef(null);\n  const filterModalRef = useRef(null);\n  const snapPoints = React.useMemo(() => ['100%'], []);\n";
content = content.replace(
  /const \[isDetailModalVisible, setDetailModalVisible\] = useState\(false\);/,
  "const [isDetailModalVisible, setDetailModalVisible] = useState(false);\n" + refsCode
);

content = content.replace(
  /setAddModalVisible\(true\)/g,
  "(() => { setAddModalVisible(true); addModalRef.current?.present(); })()"
);
content = content.replace(
  /setAddModalVisible\(false\)/g,
  "(() => { setAddModalVisible(false); addModalRef.current?.dismiss(); })()"
);

content = content.replace(
  /setSelectedNote\(note\);\s*setDetailModalVisible\(true\);/g,
  "setSelectedNote(note); setDetailModalVisible(true); detailModalRef.current?.present();"
);
content = content.replace(
  /setDetailModalVisible\(false\);/g,
  "setDetailModalVisible(false); detailModalRef.current?.dismiss();"
);

content = content.replace(
  /setFilterModalVisible\(true\)/g,
  "(() => { setFilterModalVisible(true); filterModalRef.current?.present(); })()"
);
content = content.replace(
  /setFilterModalVisible\(false\)/g,
  "(() => { setFilterModalVisible(false); filterModalRef.current?.dismiss(); })()"
);

const backdropJSX = 'backdropComponent={(p) => <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />}';

content = content.replace(
  /<Modal[\s\S]*?visible=\{isAddModalVisible\}[\s\S]*?<KeyboardAvoidingView[^>]*>\s*<View[^>]*>/,
  '<BottomSheetModal ref={addModalRef} index={0} snapPoints={snapPoints} enablePanDownToClose onChange={(i) => { if (i===-1) setAddModalVisible(false); }} keyboardBehavior="interactive" handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }} backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }} ' + backdropJSX + '>\n<BottomSheetView className="flex-1 px-8 pt-4 pb-14">'
);

content = content.replace(
  /<Modal[\s\S]*?visible=\{isDetailModalVisible\}[\s\S]*?<KeyboardAvoidingView[^>]*>\s*<View[^>]*>/,
  '<BottomSheetModal ref={detailModalRef} index={0} snapPoints={snapPoints} enablePanDownToClose onChange={(i) => { if (i===-1) setDetailModalVisible(false); }} keyboardBehavior="interactive" handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }} backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }} ' + backdropJSX + '>\n<BottomSheetView className="flex-1 px-8 pt-4 pb-14">'
);

content = content.replace(
  /<Modal[\s\S]*?visible=\{isFilterModalVisible\}[\s\S]*?<View[^>]*>\s*<View[^>]*>/,
  '<BottomSheetModal ref={filterModalRef} index={0} snapPoints={snapPoints} enablePanDownToClose onChange={(i) => { if (i===-1) setFilterModalVisible(false); }} keyboardBehavior="interactive" handleIndicatorStyle={{ backgroundColor: "#f1f5f9", width: 48, height: 6 }} backgroundStyle={{ backgroundColor: "white", borderRadius: 40 }} ' + backdropJSX + '>\n<BottomSheetView className="flex-1 px-6 pt-4 pb-10">'
);

content = content.replace(/<\/KeyboardAvoidingView>\s*<\/Modal>/g, '</BottomSheetView>\n</BottomSheetModal>');
content = content.replace(/<\/View>\s*<\/Modal>/g, '</BottomSheetView>\n</BottomSheetModal>');

content = content.replace(/<TextInput/g, '<BottomSheetTextInput');
content = content.replace(/<\/TextInput>/g, '</BottomSheetTextInput>');
content = content.replace(/<ScrollView/g, '<BottomSheetScrollView');
content = content.replace(/<\/ScrollView>/g, '</BottomSheetScrollView>');

fs.writeFileSync('app/(tabs)/overview.tsx', content);
