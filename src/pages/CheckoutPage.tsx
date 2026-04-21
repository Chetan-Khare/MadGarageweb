import React, { useState, useEffect } from 'react';
import { useLocation as useDomLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, CreditCard, MapPin, 
    ShieldCheck, Package, ShoppingBag,
    CheckCircle, AlertCircle, Store, Truck, Navigation,
    Home, Briefcase
} from 'lucide-react';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

const CheckoutPage: React.FC = () => {
    const domLocation = useDomLocation();
    const navigate = useNavigate();
    const { cart, subtotal: cartSubtotal, clearCart } = useCart();
    const { city: detectedCity, address: detectedAddress, nearbyGarages, fetchGarages } = useLocation();
    
    // Support both single product "Buy Now" and "Cart Checkout"
    const { product: buyNowProduct, quantity: buyNowQuantity } = domLocation.state || {};
    
    // Final product list for checkout
    const checkoutItems = buyNowProduct ? [{ ...buyNowProduct, quantity: buyNowQuantity }] : cart;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [flatNo, setFlatNo] = useState('');
    const [floorNo, setFloorNo] = useState('');
    const [buildingName, setBuildingName] = useState('');
    const [streetArea, setStreetArea] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    
    // Fitting State
    const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'GARAGE_FITTING'>('HOME_DELIVERY');
    const [selectedGarageId, setSelectedGarageId] = useState<number | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [config, setConfig] = useState({ shippingFee: 250, freeThreshold: 400, platformFee: 7 });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/config/public');
                setConfig({
                    shippingFee: parseInt(response.data.SHIPPING_FEE || '250', 10),
                    freeThreshold: parseInt(response.data.FREE_SHIPPING_THRESHOLD || '400', 10),
                    platformFee: parseInt(response.data.PLATFORM_FEE || '7', 10)
                });
            } catch (error) {
                console.error('Failed to fetch public config:', error);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        const fetchSavedAddresses = async () => {
            try {
                const response = await apiClient.get('/addresses');
                setSavedAddresses(response.data);
            } catch (error) {
                console.error('Failed to fetch addresses for checkout:', error);
            }
        };
        fetchSavedAddresses();
    }, []);

    useEffect(() => {
        // Auto-fill from detection if form is empty and detection results arrive
        if (detectedCity && !city && !streetArea) setCity(detectedCity);
        if (detectedAddress && !streetArea && !city) setStreetArea(detectedAddress);
    }, [detectedCity, detectedAddress]);

    const useSavedAddress = (addr: any) => {
        // Since backend currently returns a single concatenated string in 'address',
        // we'll put it into 'streetArea' for now as a fallback.
        setStreetArea(addr.address || '');
        setFlatNo('');
        setFloorNo('');
        setBuildingName('');
        setLandmark('');
        
        setCity(addr.city || '');
        setState(addr.state || '');
        setPincode(addr.pincode || '');
        setError(null);
    };

    const useDetectedLocation = () => {
        if (detectedAddress) setStreetArea(detectedAddress);
        if (detectedCity) setCity(detectedCity);
        setError(null);
    };

    const clearAddress = () => {
        setFlatNo('');
        setFloorNo('');
        setBuildingName('');
        setStreetArea('');
        setLandmark('');
        setCity('');
        setState('');
        setPincode('');
        setError(null);
    };

    useEffect(() => {
        if (city && city.length > 2) {
            fetchGarages(city);
        }
    }, [city, fetchGarages]);

    useEffect(() => {
        if (checkoutItems.length === 0) {
            navigate('/cart');
        }
    }, [checkoutItems, navigate]);

    if (checkoutItems.length === 0) return null;

    const subtotal = buyNowProduct ? (buyNowProduct.garagePrice || buyNowProduct.price || 0) * buyNowQuantity : cartSubtotal;
    const shippingFee = (checkoutItems.length > 0 && subtotal < config.freeThreshold) ? config.shippingFee : 0;
    const platformFee = subtotal > 0 ? config.platformFee : 0;
    const total = subtotal + shippingFee + platformFee;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
            setError('Please enter a valid 6-digit pincode.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fullAddress = [
                flatNo ? `Flat ${flatNo}` : '',
                floorNo ? `Floor ${floorNo}` : '',
                buildingName,
                streetArea,
                landmark ? `Near ${landmark}` : ''
            ].filter(Boolean).join(', ');

            if (!fullAddress) {
                setError('Please provide a delivery address.');
                setLoading(false);
                return;
            }

            const response = await apiClient.post('/orders/checkout', {
                items: checkoutItems.map(item => ({ 
                    productId: item.id, 
                    quantity: item.quantity 
                })),
                shippingAddress: fullAddress,
                city,
                state,
                pincode,
                deliveryType,
                fittingGarageId: deliveryType === 'GARAGE_FITTING' ? selectedGarageId : null
            });

            if (!buyNowProduct) clearCart(); // Clear cart only if this was a cart checkout
            setSuccess(true);
            setTimeout(() => {
                navigate(`/order/${response.data.id}`);
            }, 2000);
        } catch (err: any) {
            console.error('Checkout failed:', err);
            setError(err.response?.data?.message || 'Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#08080C] flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 bg-green-500 text-black rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                        <CheckCircle size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Payment <span className="text-green-500">Verified!</span></h2>
                        <p className="text-gray-400 font-medium tracking-wide">Your order has been transmitted to the merchant. Redirecting to receipt...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Secure <span className="text-primary italic">Checkout</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Mad Garage Order Gateway</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">256-Bit SSL Encryption</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8 pt-48 md:pt-56 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Form */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-8">
                             <div className="flex items-center gap-4">
                                <div className="h-8 w-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <Package size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Fulfillment Mode</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button 
                                    type="button"
                                    onClick={() => setDeliveryType('HOME_DELIVERY')}
                                    className={`p-8 rounded-[2.5rem] border transition-all text-left flex flex-col gap-4 ${deliveryType === 'HOME_DELIVERY' ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-[#121216] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${deliveryType === 'HOME_DELIVERY' ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black uppercase italic tracking-tighter ${deliveryType === 'HOME_DELIVERY' ? 'text-primary' : 'text-white'}`}>Home Delivery</h4>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Direct to your doorstep</p>
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setDeliveryType('GARAGE_FITTING')}
                                    className={`p-8 rounded-[2.5rem] border transition-all text-left flex flex-col gap-4 ${deliveryType === 'GARAGE_FITTING' ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-[#121216] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${deliveryType === 'GARAGE_FITTING' ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                                        <Store size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black uppercase italic tracking-tighter ${deliveryType === 'GARAGE_FITTING' ? 'text-primary' : 'text-white'}`}>Garage Fitting</h4>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Visit a partner workshop</p>
                                    </div>
                                </button>
                            </div>

                            {deliveryType === 'GARAGE_FITTING' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Select Your Partner Garage</h4>
                                        <div className="flex items-center gap-2 text-[8px] font-bold text-primary uppercase animate-pulse">
                                            <Navigation size={10} /> Local Matching Active
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                        {nearbyGarages.length > 0 ? (
                                            nearbyGarages.map(garage => (
                                                <div 
                                                    key={garage.id}
                                                    onClick={() => setSelectedGarageId(garage.id)}
                                                    className={`min-w-[280px] p-6 rounded-[2rem] border cursor-pointer transition-all ${selectedGarageId === garage.id ? 'bg-primary text-white border-primary shadow-2xl' : 'bg-[#121216] border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${selectedGarageId === garage.id ? 'bg-white text-primary' : 'bg-white/5 text-primary'}`}>
                                                            {garage.firstName[0]}
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black italic uppercase tracking-tighter leading-tight">{garage.firstName} {garage.lastName}</h5>
                                                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 opacity-60`}>{garage.distance?.toFixed(1)} km • {garage.city}</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-current opacity-30`} style={{ width: '100%' }} />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full bg-primary/5 border border-dashed border-primary/20 p-8 rounded-[2rem] text-center">
                                                <p className="text-[9px] font-black uppercase text-primary tracking-widest">No verified garages in {city || 'your area'}</p>
                                                <p className="text-[8px] text-gray-500 mt-2 font-bold uppercase tracking-widest whitespace-nowrap">Service arriving soon. Please select Home Delivery.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                            <MapPin size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Shipping Protocol</h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 overflow-x-auto max-w-[300px] scrollbar-hide">
                                        {savedAddresses.map(addr => (
                                            <button 
                                                key={addr.id}
                                                type="button"
                                                onClick={() => useSavedAddress(addr)}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap"
                                            >
                                                {addr.tag === 'HOME' ? <Home size={10} className="inline mr-1"/> : addr.tag === 'OFFICE' ? <Briefcase size={10} className="inline mr-1"/> : <MapPin size={10} className="inline mr-1"/>}
                                                {addr.tag}
                                            </button>
                                        ))}
                                        <button 
                                            type="button"
                                            onClick={useDetectedLocation}
                                            disabled={!detectedAddress}
                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:hover:bg-white/5 whitespace-nowrap"
                                        >
                                            Detected 
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={clearAddress}
                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8 p-10 bg-[#121216] rounded-[3rem] border border-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Flat / Shop No.</label>
                                        <input 
                                            type="text" 
                                            placeholder="G-402 / Shop 12"
                                            className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                            value={flatNo}
                                            onChange={e => setFlatNo(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Floor No.</label>
                                        <input 
                                            type="text" 
                                            placeholder="4th Floor"
                                            className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                            value={floorNo}
                                            onChange={e => setFloorNo(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Building / Complex Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="SpeedWay Apartments"
                                        className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                        value={buildingName}
                                        onChange={e => setBuildingName(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Street / Area</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="Main Road, Sector 5"
                                        className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                        value={streetArea}
                                        onChange={e => setStreetArea(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Landmark</label>
                                    <input 
                                        type="text" 
                                        placeholder="Near Phoenix Mall"
                                        className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                        value={landmark}
                                        onChange={e => setLandmark(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">City</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Mumbai"
                                            className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">State</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Maharashtra"
                                            className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" 
                                            value={state}
                                            onChange={e => setState(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Pincode</label>
                                    <input 
                                        required 
                                        type="tel" 
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        placeholder="400001"
                                        className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all w-full md:w-1/2" 
                                        value={pincode}
                                        onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-8 bg-green-500/5 border border-green-500/10 rounded-[2.5rem] flex items-center gap-6">
                             <div className="h-12 w-12 bg-green-500 text-black rounded-[1.2rem] flex items-center justify-center shrink-0">
                                <CreditCard size={24} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Payment Security</p>
                                <p className="text-[11px] text-gray-400 mt-1 font-medium italic italic">"Your financial profile is never stored. All transactions are settled via MAD-SAFE bank integration."</p>
                             </div>
                        </div>

                        {error && (
                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 animate-shake">
                                <AlertCircle size={20} />
                                <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-56 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center">
                                    <Package size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Order Summary</h3>
                            </div>

                            <div className="bg-[#121216] p-10 rounded-[3rem] border border-white/10 space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
                                
                                {/* Checkout items in summary */}
                                <div className="space-y-6 relative z-10 pb-10 border-b border-white/5 max-h-[300px] overflow-y-auto scrollbar-hide">
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-6">
                                            <div className="h-20 w-20 bg-black rounded-2xl overflow-hidden border border-white/10 p-3 shrink-0">
                                                <img 
                                                    src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}`) : 'https://via.placeholder.com/100'} 
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black italic uppercase tracking-tighter text-white leading-tight line-clamp-1">{item.name}</h4>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.quantity} Units</p>
                                                    <p className="text-[10px] font-black text-white italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Secure Infrastructure Fee</span>
                                        <span className="text-white">₹{platformFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Logistics & Handling</span>
                                        <span className="text-white">
                                            {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}
                                        </span>
                                    </div>
                                    {deliveryType === 'GARAGE_FITTING' && (
                                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Store size={14} className="text-primary" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">Precision Fitting Service</span>
                                            </div>
                                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                                                Labor settlement based on garage inspection. <span className="text-white">Pay part price only online.</span>
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Total Amount</span>
                                        <span className="text-3xl font-black italic text-primary tracking-tighter uppercase leading-none">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    form="checkout-form"
                                    type="submit"
                                    disabled={loading || (deliveryType === 'GARAGE_FITTING' && !selectedGarageId)}
                                    className="w-full bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-2xl shadow-red-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {(deliveryType === 'GARAGE_FITTING' && !selectedGarageId) ? 'Select a Garage Partner' : loading ? 'Processing Transaction...' : 'Place Order'} <ShoppingBag size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
