export type RootStackParamList = {
    BarcodeScanning: undefined;
    Inventory: { 
      productData: {
        barcode: string;
        name: string;
        brand: string;
        image?: string;
        quantity?: string;
        categories?: string;
      }
    };
    //ManualEntry: { barcode?: string };
    //Inventory: { successMessage?: string };
  };