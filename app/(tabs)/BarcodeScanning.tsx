import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BarcodeScanning = () => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const hasScannedRef = useRef(false);


    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        if (hasScannedRef.current) return; // 👈 Ignore if already scanned
        hasScannedRef.current = true;
        setScanned(true);
        const code = data;

        console.log(`Scanned type: ${type}, data: ${data}`);
        alert(`Scanned a ${type} code: ${data}`);
    };


    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'ean13',
                        'upc_a',
                        'qr',
                        'code128'
                    ]
                }}

            >
            </CameraView>

            {scanned && (
                <View style={styles.resetButton}>
                    <Button
                        title="Scan Again"
                        onPress={() => {
                            setScanned(false);
                            hasScannedRef.current = false;
                        }}
                    />
                </View>
            )}

        </View>
    );



};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    resetButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default BarcodeScanning;