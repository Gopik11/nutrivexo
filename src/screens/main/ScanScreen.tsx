import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import { analyzeProduct } from '../../services/analyzeProduct';
import { isOcrAvailable, recognizeTextFromImage } from '../../services/ocr';
import type { MainTabScreenProps } from '../../navigation/types';

type Mode = 'camera' | 'manual';
type CameraState = 'idle' | 'capturing' | 'processing' | 'error';

const ocrAvailable = isOcrAvailable();

export function ScanScreen({ navigation }: MainTabScreenProps<'Scan'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>(ocrAvailable ? 'camera' : 'manual');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [productName, setProductName] = useState('');
  const cameraRef = useRef<CameraView>(null);

  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const setCameraPermissionGranted = useAppStore((state) => state.setCameraPermissionGranted);

  const runAnalysis = (rawText: string, name?: string) => {
    const trimmed = rawText.trim();
    if (trimmed.length < 3) {
      setCameraError(strings.scan.noTextFound);
      setCameraState('error');
      return;
    }
    const analysis = analyzeProduct({
      rawText: trimmed,
      productName: name,
      healthProfile: healthProfileDraft,
      source: mode === 'camera' ? 'scanned' : 'lookup',
    });
    setCameraState('idle');
    setManualText('');
    setProductName('');
    navigation.navigate('Results', { analysis });
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCameraState('capturing');
    setCameraError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error('No photo captured.');
      setCameraState('processing');
      const text = await recognizeTextFromImage(photo.uri);
      runAnalysis(text);
    } catch (error) {
      setCameraState('error');
      setCameraError(
        error instanceof Error && error.name === 'OcrUnavailableError'
          ? strings.scan.ocrUnavailable
          : strings.scan.ocrFailed
      );
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    setCameraPermissionGranted(result.granted);
  };

  const renderModeSwitch = () => (
    <View className="flex-row bg-neutral-800 rounded-full p-1 self-center mb-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.scan.modeCamera}
        accessibilityState={{ selected: mode === 'camera' }}
        onPress={() => {
          setMode('camera');
          setCameraState('idle');
          setCameraError(null);
        }}
        className={['px-4 py-2 rounded-full', mode === 'camera' ? 'bg-accent-500' : ''].join(' ')}
      >
        <Text className={mode === 'camera' ? 'text-white font-semibold' : 'text-neutral-400'}>
          {strings.scan.modeCamera}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.scan.modeManual}
        accessibilityState={{ selected: mode === 'manual' }}
        onPress={() => setMode('manual')}
        className={['px-4 py-2 rounded-full', mode === 'manual' ? 'bg-accent-500' : ''].join(' ')}
      >
        <Text className={mode === 'manual' ? 'text-white font-semibold' : 'text-neutral-400'}>
          {strings.scan.modeManual}
        </Text>
      </Pressable>
    </View>
  );

  const renderCameraBody = () => {
    if (!permission) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A8734F" />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="camera-outline" size={40} color="#A89F92" />
          <Text className="text-h3 text-white text-center mt-4 mb-2">
            {strings.scan.cameraPermissionTitle}
          </Text>
          <Text className="text-body-sm text-neutral-300 text-center mb-5">
            {strings.scan.cameraPermissionBody}
          </Text>
          {permission.canAskAgain ? (
            <Button label={strings.scan.enableCamera} onPress={handleRequestPermission} />
          ) : (
            <Button
              label={strings.scan.openSettings}
              variant="secondary"
              onPress={() => Linking.openSettings()}
            />
          )}
        </View>
      );
    }

    if (cameraState === 'error') {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color="#C45C4A" />
          <Text className="text-body text-white text-center mt-4 mb-5">{cameraError}</Text>
          <View className="flex-row">
            <Button
              label={strings.scan.tryAgain}
              variant="secondary"
              onPress={() => {
                setCameraState('idle');
                setCameraError(null);
              }}
              className="mr-3"
            />
            <Button label={strings.scan.typeInstead} onPress={() => setMode('manual')} />
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 rounded-xl overflow-hidden">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 justify-end items-center pb-6">
            {cameraState === 'processing' ? (
              <View className="items-center bg-black/60 rounded-xl px-6 py-4">
                <ActivityIndicator color="#FFFFFF" />
                <Text className="text-body-sm text-white mt-2">{strings.scan.readingLabel}</Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Capture label photo"
                onPress={handleCapture}
                disabled={cameraState === 'capturing'}
                className="w-16 h-16 rounded-full bg-accent-500 items-center justify-center border-4 border-white/40"
              >
                <Ionicons name="camera" size={28} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </CameraView>
      </View>
    );
  };

  const renderManualBody = () => (
    <View className="flex-1">
      <Text className="text-body-sm text-neutral-400 mb-2">{strings.scan.productNameLabel}</Text>
      <TextInput
        value={productName}
        onChangeText={setProductName}
        placeholder={strings.scan.productNamePlaceholder}
        placeholderTextColor="#7A7268"
        accessibilityLabel="Product name"
        className="bg-neutral-800 text-white rounded-lg px-4 py-3 mb-4"
      />
      <Text className="text-body-sm text-neutral-400 mb-2">{strings.scan.ingredientsLabel}</Text>
      <TextInput
        value={manualText}
        onChangeText={setManualText}
        placeholder={strings.scan.ingredientsPlaceholder}
        placeholderTextColor="#7A7268"
        multiline
        textAlignVertical="top"
        accessibilityLabel="Ingredients text"
        className="bg-neutral-800 text-white rounded-lg px-4 py-3 flex-1 mb-4"
      />
      <Button
        label={strings.scan.analyze}
        fullWidth
        disabled={manualText.trim().length < 3}
        onPress={() => runAnalysis(manualText, productName)}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 px-5">
        <View className="pt-4 mb-2">
          <Text className="text-h2 text-white mb-1">{strings.scan.title}</Text>
          <Text className="text-body-sm text-neutral-300">{strings.scan.subtitle}</Text>
        </View>

        {ocrAvailable && renderModeSwitch()}

        <View className="flex-1 pb-6">
          {mode === 'camera' ? renderCameraBody() : renderManualBody()}
        </View>
      </View>
    </SafeAreaView>
  );
}
