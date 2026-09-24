import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import { analyzeProduct } from '../../services/analyzeProduct';
import { isOcrAvailable, recognizeTextFromImage } from '../../services/ocr';
import { lookupProductByBarcode } from '../../services/openFoodFacts';
import type { MainTabScreenProps } from '../../navigation/types';
import type { NutritionFacts } from '../../types';

type Mode = 'camera' | 'barcode' | 'manual';
type CameraState = 'idle' | 'capturing' | 'processing' | 'error';
type BarcodeState = 'scanning' | 'looking-up' | 'error';

// Grocery/retail packaging almost always uses one of these. Code128 is included for
// house-brand or bulk items that sometimes carry a non-retail barcode format.
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const;

const ocrAvailable = isOcrAvailable();

export function ScanScreen({ navigation }: MainTabScreenProps<'Scan'>) {
  const [permission, requestPermission] = useCameraPermissions();
  // Barcode scanning is built into expo-camera's CameraView itself, so — unlike the OCR
  // "Camera" mode — it works even in a build without the ML Kit text-recognition module.
  const [mode, setMode] = useState<Mode>(ocrAvailable ? 'camera' : 'barcode');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [productName, setProductName] = useState('');
  const [barcodeState, setBarcodeState] = useState<BarcodeState>('scanning');
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const barcodeLookupInFlight = useRef(false);

  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const settings = useAppStore((state) => state.settings);
  const setCameraPermissionGranted = useAppStore((state) => state.setCameraPermissionGranted);

  const runAnalysis = (
    rawText: string,
    name?: string,
    extra?: {
      source?: 'scanned' | 'lookup' | 'barcode';
      barcode?: string;
      brand?: string;
      category?: string;
      nutritionFacts?: NutritionFacts;
    }
  ) => {
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
      mutedAmbiguousAllergens: settings.mutedAmbiguousAllergens,
      source: extra?.source ?? (mode === 'camera' ? 'scanned' : 'lookup'),
      barcode: extra?.barcode,
      brand: extra?.brand,
      category: extra?.category,
      nutritionFacts: extra?.nutritionFacts,
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

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (barcodeLookupInFlight.current) return;
      barcodeLookupInFlight.current = true;
      setBarcodeState('looking-up');
      setBarcodeError(null);
      try {
        const lookup = await lookupProductByBarcode(result.data);
        if (lookup.networkError) {
          setBarcodeError(strings.scan.barcodeLookupFailed);
          setBarcodeState('error');
          return;
        }
        if (!lookup.found) {
          setBarcodeError(strings.scan.barcodeNotFound);
          setBarcodeState('error');
          return;
        }
        if (!lookup.ingredientsText || lookup.ingredientsText.trim().length < 3) {
          setBarcodeError(strings.scan.barcodeNoIngredients);
          setBarcodeState('error');
          return;
        }
        setBarcodeState('scanning');
        runAnalysis(lookup.ingredientsText, lookup.productName, {
          source: 'barcode',
          barcode: result.data,
          brand: lookup.brand,
          category: lookup.category,
          nutritionFacts: lookup.nutritionFacts,
        });
      } finally {
        barcodeLookupInFlight.current = false;
      }
    },
    [runAnalysis]
  );

  const renderModeSwitch = () => (
    <View className="flex-row bg-neutral-800 rounded-full p-1 self-center mb-4">
      {ocrAvailable && (
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
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.scan.modeBarcode}
        accessibilityState={{ selected: mode === 'barcode' }}
        onPress={() => {
          setMode('barcode');
          setBarcodeState('scanning');
          setBarcodeError(null);
        }}
        className={['px-4 py-2 rounded-full', mode === 'barcode' ? 'bg-accent-500' : ''].join(' ')}
      >
        <Text className={mode === 'barcode' ? 'text-white font-semibold' : 'text-neutral-400'}>
          {strings.scan.modeBarcode}
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

  const renderBarcodeBody = () => {
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
          <Ionicons name="barcode-outline" size={40} color="#A89F92" />
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

    if (barcodeState === 'error') {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color="#C45C4A" />
          <Text className="text-body text-white text-center mt-4 mb-5">{barcodeError}</Text>
          <View className="flex-row">
            <Button
              label={strings.scan.tryAgain}
              variant="secondary"
              onPress={() => {
                setBarcodeState('scanning');
                setBarcodeError(null);
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
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={barcodeState === 'scanning' ? handleBarcodeScanned : undefined}
        >
          <View className="flex-1 justify-center items-center">
            <View
              className="w-4/5 h-28 border-2 border-white/70 rounded-xl"
              style={{ borderStyle: 'dashed' }}
            />
          </View>
          <View className="pb-6 items-center">
            {barcodeState === 'looking-up' ? (
              <View className="items-center bg-black/60 rounded-xl px-6 py-4">
                <ActivityIndicator color="#FFFFFF" />
                <Text className="text-body-sm text-white mt-2">
                  {strings.scan.barcodeLookingUp}
                </Text>
              </View>
            ) : (
              <Text className="text-body-sm text-white bg-black/50 rounded-full px-4 py-2">
                {strings.scan.barcodeInstructions}
              </Text>
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

        {renderModeSwitch()}

        <View className="flex-1 pb-6">
          {mode === 'camera'
            ? renderCameraBody()
            : mode === 'barcode'
              ? renderBarcodeBody()
              : renderManualBody()}
        </View>
      </View>
    </SafeAreaView>
  );
}
