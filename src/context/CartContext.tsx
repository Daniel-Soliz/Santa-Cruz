import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MenuItem, 
  CartItem, 
  SelectedOption, 
  OrderCustomer, 
  OrderAddress, 
  PaymentMethod,
  StoreSettings 
} from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  customer: OrderCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<OrderCustomer>>;
  address: OrderAddress;
  setAddress: React.Dispatch<React.SetStateAction<OrderAddress>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  changeFor: string;
  setChangeFor: (val: string) => void;
  couponCode: string;
  couponDiscount: number;
  couponDescription: string;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  addItem: (item: MenuItem, quantity: number, selectedOptions?: SelectedOption[], observation?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemsCount: number;
  storeSettings: StoreSettings | null;
  deliveryQuote: { available: boolean; cep: string; zone: string; fee: number; estimatedMinutes: number } | null;
  deliveryQuoteError: string;
  isQuotingDelivery: boolean;
  refreshSettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('delicia_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(() => {
    return (localStorage.getItem('delicia_delivery_type') as 'delivery' | 'pickup') || 'delivery';
  });

  const [customer, setCustomer] = useState<OrderCustomer>(() => {
    try {
      const saved = localStorage.getItem('delicia_customer');
      return saved ? JSON.parse(saved) : { name: '', phone: '', email: '' };
    } catch {
      return { name: '', phone: '', email: '' };
    }
  });

  const [address, setAddress] = useState<OrderAddress>(() => {
    try {
      const saved = localStorage.getItem('delicia_address');
      return saved ? JSON.parse(saved) : {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'São Paulo',
        state: 'SP',
        reference: ''
      };
    } catch {
      return {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'São Paulo',
        state: 'SP',
        reference: ''
      };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponDescription, setCouponDescription] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<CartContextType['deliveryQuote']>(null);
  const [deliveryQuoteError, setDeliveryQuoteError] = useState('');
  const [isQuotingDelivery, setIsQuotingDelivery] = useState(false);

  const refreshSettings = async () => {
    try {
      const s = await api.getSettings();
      setStoreSettings(s);
    } catch (e) {
      console.error('Error fetching settings in CartProvider', e);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('delicia_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('delicia_delivery_type', deliveryType);
  }, [deliveryType]);

  useEffect(() => {
    localStorage.setItem('delicia_customer', JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem('delicia_address', JSON.stringify(address));
  }, [address]);

  // Taxa e atendimento ao CEP confirmados no servidor.
  const subtotal = items.reduce((sum, item) => sum + item.totalPriceCalculated, 0);
  useEffect(() => {
    if (deliveryType !== 'delivery') {
      setDeliveryQuote(null);
      setDeliveryQuoteError('');
      setIsQuotingDelivery(false);
      return;
    }
    const cep = address.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      setDeliveryQuote(null);
      setIsQuotingDelivery(false);
      setDeliveryQuoteError('Informe o CEP para calcular a entrega.');
      return;
    }
    let cancelled = false;
    setDeliveryQuote(null);
    setIsQuotingDelivery(true);
    setDeliveryQuoteError('');
    api.quoteDelivery(cep, subtotal).then(quote => {
      if (!cancelled) setDeliveryQuote(quote);
    }).catch((err: Error) => {
      if (!cancelled) setDeliveryQuoteError(err.message || 'Entrega indisponível.');
    }).finally(() => {
      if (!cancelled) setIsQuotingDelivery(false);
    });
    return () => { cancelled = true; };
  }, [deliveryType, address.cep, subtotal]);

  const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return;
    const res = await api.validateCoupon(code.trim(), subtotal);
    setCouponCode(res.code);
    setCouponDiscount(res.discountAmount);
    setCouponDescription(res.description);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponDescription('');
  };

  const addItem = (
    item: MenuItem, 
    quantity: number, 
    selectedOptions: SelectedOption[] = [], 
    observation: string = ''
  ) => {
    // Generate a unique identifier for the dish + option permutation
    const sortedOptionKeys = selectedOptions
      .map(o => `${o.groupId}:${o.choiceId}`)
      .sort()
      .join('|');
    const cartItemId = `${item.id}_${sortedOptionKeys}_${observation.trim().toLowerCase()}`;

    let unitPrice = item.promotionalPrice ?? item.price;
    selectedOptions.forEach(opt => {
      unitPrice += opt.priceModifier;
    });

    setItems(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => {
          if (i.cartItemId === cartItemId) {
            const newQty = i.quantity + quantity;
            return {
              ...i,
              quantity: newQty,
              totalPriceCalculated: unitPrice * newQty
            };
          }
          return i;
        });
      }

      return [
        ...prev,
        {
          cartItemId,
          menuItem: item,
          quantity,
          selectedOptions,
          observation,
          unitPriceCalculated: unitPrice,
          totalPriceCalculated: unitPrice * quantity
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(i => {
          if (i.cartItemId === cartItemId) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...i,
              quantity: newQty,
              totalPriceCalculated: i.unitPriceCalculated * newQty
            };
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponDescription('');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryType,
        setDeliveryType,
        customer,
        setCustomer,
        address,
        setAddress,
        paymentMethod,
        setPaymentMethod,
        changeFor,
        setChangeFor,
        couponCode,
        couponDiscount,
        couponDescription,
        applyCoupon,
        removeCoupon,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        deliveryFee,
        total,
        itemsCount,
        storeSettings,
        deliveryQuote,
        deliveryQuoteError,
        isQuotingDelivery,
        refreshSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
