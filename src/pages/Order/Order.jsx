import { FormControl, MenuItem, Select } from '@mui/material';
import { Button, Col, Divider, Grid, Image, Input, Loading, Radio, Row, Spacer, Text } from '@nextui-org/react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calShipingFee, getDistrict, getProvince, getService, getWard } from '../../services/AuthService';
import { getCart } from '../../services/CartService';
import { makeAnOrder } from '../../services/Payment';
import { getUserByID } from '../../services/UserService';
import { getUserFromLocalStorage } from '../../utils/userHanle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UpdateError } from '../../components/Alert/UpdateError';
import { UpdateSuccessNavigate } from '../../components/Alert/UpdateSuccessNavigate';
import validator from 'validator';
import { UpdateSuccessReload } from '../../components/Alert/UpdateSuccessReload';
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
function Order() {
    let navigate = useNavigate();
    let curUser = getUserFromLocalStorage();
    const formatPrice = (value) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);

    const [cart, setCart] = useState({});
    useEffect(() => {
        async function getData() {
            let res = await getCart();
            setCart(res.data);
        }
        getData();
    }, []);

    const [user, setUser] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [province, setProvince] = useState();
    const [district, setDistrict] = useState();
    const [ward, setWard] = useState();
    const [shippingFee, setShippingFee] = useState(0);
    const [serviceType, setServiceType] = useState({});

    useEffect(() => {
        async function getData() {
            let res = await getUserByID(curUser.id);
            if (res.success) {
                setUser(res.data);
            }
        }
        getData();
    }, [curUser.id]);
    useEffect(() => {
        async function getProvinceAPI(data) {
            let provinces = await getProvince({ data });
            if (provinces.message === 'Success') {
                setProvinces(provinces.data);
            }
        }
        getProvinceAPI({});
    }, []);
    useEffect(() => {
        async function getDistrictAPI(province_id) {
            let districts = await getDistrict({ province_id });
            if (districts.message === 'Success') {
                setDistricts(districts.data);
            }
        }
        if (province !== undefined) {
            getDistrictAPI(province);
        }
    }, [province]);

    useEffect(() => {
        async function getWardAPI(district_id) {
            let wards = await getWard({ district_id });
            if (wards.message === 'Success') {
                setWards(wards.data);
            }
        }
        if (district !== undefined) {
            getWardAPI(district);
        }
    }, [province, district]);

    useEffect(() => {
        async function getServiceTypeAPI() {
            if (district, ward) {
                let service = await getService({
                    to_district_id: district,
                });
                if (service.code === 200) {
                    setServiceType({list: service.data, value: service.data[0]?.service_type_id});
                }
            } else setServiceType();
        }
        getServiceTypeAPI();
    }, [district, ward]);
    useEffect(() => {
        async function calShippingFeeAPI() {
            if (district && ward && cart.totalProduct && serviceType) {
                let fee = await calShipingFee({
                    service_type_id: serviceType.value,
                    to_district_id: district,
                    to_ward_code: ward,
                    weight: 30 * cart.totalProduct < 30000 ? 30 * cart.totalProduct : 30000,
                    height: cart.totalProduct < 150 ? cart.totalProduct : 150,
                });
                if (fee.code === 200) {
                    setShippingFee(fee.data.total);
                }
            } else setShippingFee(0);
        }
        calShippingFeeAPI();
    }, [serviceType]);

    const handleChangeWard = (e) => {
        setUser({ ...user, ward: e.target.value });
        setWard(e.target.value);
    };
    const handleChangeService = (e) => {
        setServiceType({...serviceType, value: e.target.value});
    };
    const handleChangeDistrict = (e) => {
        setUser({ ...user, district: e.target.value });
        setDistrict(e.target.value);
        setWard(undefined);
        setWards([]);
    };
    const handleChangeProvince = (e) => {
        setUser({ ...user, province: e.target.value });
        setProvince(e.target.value);
        setDistrict(undefined);
        setWard(undefined);
        setDistricts([]);
        setWards([]);
    };
    const handleChangeName = (e) => {
        setUser({ ...user, name: e.target.value });
    };
    const handleChangePhone = (e) => {
        setUser({ ...user, phone: e.target.value });
    };
    const handleChangeEmail = (e) => {
        setUser({ ...user, email: e.target.value });
    };
    const handleChangeAddress = (e) => {
        setUser({ ...user, address: e.target.value });
    };

    if (curUser?.id === undefined) {
        navigate('/');
    }
    const backCart = () => {
        navigate('/cart');
    };
    const [paymentType, setPaymentType] = useState('cod');

    const makeOrder = async (paymentType, orderId, user) => {
        if(validator.isEmpty(user.name)){
            toast.error('Vui l??ng nh???p t??n', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        else if(!validator.isEmail(user.email)){
            toast.error('Email kh??ng h???p l???. Vui l??ng nh???p l???i', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        else if(!validator.isMobilePhone(user.phone,'vi-VN')){
            toast.error('S??? ??i???n tho???i kh??ng h???p l???. Vui l??ng nh???p l???i', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        else if(province === undefined){
            toast.error('Vui l??ng ch???n t???nh th??nh', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        else if (district === undefined)
        {
            toast.error('Vui l??ng ch???n qu???n huy???n', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else if(ward === undefined){
            toast.error('Vui l??ng ch???n x?? ph?????ng', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else if(serviceType === undefined){
            toast.error('Vui l??ng ch???n ph????ng th???c v???n chuy???n', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        else if(validator.isEmpty(user.address)){
            toast.error('Vui l??ng nh???p ?????a ch??? c???a b???n', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
        
        else {
            const wait = toast.loading('Vui l??ng ch??? ...');
            let res = await makeAnOrder(paymentType, orderId, { ...user, 
                shippingFee: shippingFee, serviceType: serviceType.value });
                console.log(res)
            if (res.data.success) {
                if (paymentType === 'cod') {
                    UpdateSuccessReload(wait, '?????t h??ng th??nh c??ng', false);
                    window.location.href = '/redirect/payment?success=true&cancel=false'

                } else {
                    window.location.href = res.data.data;
                }
            } else {
                if(res.data.status === 409){
                    const errMsg = res.data.message.split(':')[1]
                    UpdateError(wait, `Qu?? s??? l?????ng s???n ph???m ${errMsg} hi???n c??. Vui l??ng ch???n s??? l?????ng kh??c`);
                }else{
                    UpdateError(wait, '?????t h??ng kh??ng th??nh c??ng');
                }
                
            }
        }
    };
    const handleClickOrder = () => {
        makeOrder(paymentType, cart.id, user);
    };
    return (
        <Grid.Container gap={2}>
            <Grid xs={12} sm={7} direction="column" justify="center">
                <Row gap={1} justify="center">
                    <Text size={'$4xl'}>TH??NG TIN GIAO H??NG</Text>
                </Row>
                <Row gap={1} css={{ marginTop: '$5' }}>
                    <Input
                        bordered
                        size="xl"
                        width="90%"
                        label="T??n"
                        placeholder="Nguy???n V??n A"
                        value={user.name}
                        onChange={handleChangeName}
                    />
                </Row>
                <Row gap={1} css={{ marginTop: '$5' }}>
                    <Input
                        bordered
                        size="xl"
                        width="90%"
                        type={'email'}
                        label="Email"
                        placeholder="abc@gmail.com"
                        value={user.email}
                        onChange={handleChangeEmail}
                    />
                </Row>
                <Row gap={1} css={{ marginTop: '$5' }}>
                    <Input
                        bordered
                        size="xl"
                        width="90%"
                        type={'number'}
                        label="S??? ??i???n tho???i"
                        placeholder="S??? ??i???n tho???i"
                        value={user.phone}
                        onChange={handleChangePhone}
                    />
                </Row>
                <Row gap={1}>
                    <FormControl id="province" sx={{ width: '90%', m: 'unset'  }} margin="normal">
                        {/* <InputLabel id="province-label">T???nh/Th??nh ph???</InputLabel> */}
                        <Text css={{p: 'unset', lineHeight: '$md', marginTop: '0.5rem', mb: '6px'}} color='black' weight='normal' size={'1.125rem'}>T???nh/Th??nh ph???</Text>
                        <Select
                            labelId="province-label"
                            displayEmpty
                            // label="T???nh/Th??nh ph???"
                            sx={{ borderRadius: '1rem' }}
                            value={province||''}
                            onChange={handleChangeProvince}
                        >
                            <MenuItem disabled value="">
                                <Text css={{p: 'unset', lineHeight: '$md'}} color='black' weight='normal' size={'1.125rem'}>T???nh/Th??nh ph???</Text>
                            </MenuItem>
                            {provinces.map((provinceItem) => (
                                <MenuItem key={provinceItem.ProvinceID} value={provinceItem.ProvinceID}>
                                    {provinceItem.ProvinceName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Row>
                <Row gap={1}>
                    <FormControl sx={{ width: '90%', m: 'unset' }} margin="normal">
                        <Text css={{p: 'unset', lineHeight: '$md', marginTop: '0.5rem', mb: '6px'}} color='black' weight='normal' size={'1.125rem'}>Qu???n/Huy???n</Text>
                        <Select
                            labelId="district-label"
                            displayEmpty
                            disabled={province === undefined ? true : false}
                            id="district"
                            sx={{ borderRadius: '1rem' }}
                            value={district||''}
                            onChange={handleChangeDistrict}
                        >
                            <MenuItem disabled value="">
                                <Text css={{p: 'unset', lineHeight: '$md'}} color='black' weight='normal' size={'1.125rem'}>Qu???n/Huy???n</Text>
                            </MenuItem>
                            {districts.map((districtItem) => (
                                <MenuItem key={districtItem.DistrictID} value={districtItem.DistrictID}>
                                    {districtItem.DistrictName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Row>
                <Row gap={1}>
                    <FormControl sx={{ width: '90%', m:'unset' }} margin="normal">
                        {/* <InputLabel id="ward-label">Ph?????ng/X??</InputLabel> */}
                        <Text css={{p: 'unset', lineHeight: '$md', marginTop: '0.5rem', mb: '6px'}} color='black' weight='normal' size={'1.125rem'}>Ph?????ng/X??</Text>
                        <Select
                            labelId="ward-label"
                            displayEmpty
                            // label="Ph?????ng/X??"
                            disabled={district === undefined ? true : false}
                            id="ward"
                            sx={{ borderRadius: '1rem' }}
                            value={ward||''}
                            onChange={handleChangeWard}
                        >
                            <MenuItem disabled value="">
                            <Text css={{p: 'unset', lineHeight: '$md'}} color='black' weight='normal' size={'1.125rem'}>Ph?????ng/X??</Text>
                            </MenuItem>
                            {wards.map((wardItem) => (
                                <MenuItem key={wardItem.WardCode} value={wardItem.WardCode}>
                                    {wardItem.WardName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Row>
                <Row gap={1} css={{ marginTop: '$5' }}>
                    <Input
                        bordered
                        size="xl"
                        width="90%"
                        required
                        label="?????a ch???"
                        placeholder="?????a ch???"
                        value={user.address}
                        onChange={handleChangeAddress}
                    />
                </Row>
                <Row gap={1}>
                    <FormControl sx={{ width: '90%', m:'unset' }} margin="normal">
                        {/* <InputLabel id="ward-label">Ph?????ng/X??</InputLabel> */}
                        <Text css={{p: 'unset', lineHeight: '$md', marginTop: '0.5rem', mb: '6px'}} color='black' weight='normal' size={'1.125rem'}>Ph????ng th???c v???n chuy???n</Text>
                        <Select
                            labelId="service-label"
                            displayEmpty
                            // label="Ph?????ng/X??"
                            disabled={serviceType?.list === undefined ? true : false}
                            id="service"
                            sx={{ borderRadius: '1rem' }}
                            value={serviceType?.value || ''}
                            onChange={handleChangeService}
                        >
                            <MenuItem disabled value="">
                            <Text css={{p: 'unset', lineHeight: '$md'}} color='black' weight='normal' size={'1.125rem'}>Ph????ng th???c v???n chuy???n</Text>
                            </MenuItem>
                            {serviceType?.list?.map((s) => (
                                <MenuItem key={s.service_type_id} value={s.service_type_id}>
                                    {s.short_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Row>
                <Spacer y={1} />
                <Row gap={1}>
                    <Text size={'$xl'}>Ch???n ph????ng th???c thanh to??n</Text>
                </Row>
                <Row gap={1}>
                    <Radio.Group color='warning' size="lg" css={{width: '90%', boxShadow: '0 0 0 1px #d9d9d9', borderRadius: '$xs'}}  value={paymentType} onChange={setPaymentType}>
                        <Radio value="cod" css={{padding: '$9'}}>
                            <Image
                                width={40}
                                height={40}
                                autoResize
                                objectFit="contain"
                                src=" https://hstatic.net/0/0/global/design/seller/image/payment/cod.svg?v=1"
                            />
                            <Spacer />
                            Thanh to??n khi nh???n h??ng
                        </Radio>
                        <Radio value="vnpay" css={{padding: '$9' ,boxShadow: '0 0 0 1px #d9d9d9', mt:'$0 !important'}}>
                            <Image
                                width={40}
                                height={40}
                                autoResize
                                objectFit="contain"
                                src="https://hstatic.net/0/0/global/design/seller/image/payment/vnpay_new.svg?v=1"
                            />
                            <Spacer />
                            VNPAY
                        </Radio>
                        <Radio value="paypal" css={{padding: '$9' , mt:'$0 !important'}}>
                            <Image
                                width={40}
                                height={40}
                                autoResize
                                objectFit="contain"
                                src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                            />
                            <Spacer />
                            PAYPAL
                        </Radio>
                    </Radio.Group>
                </Row>
                <Spacer y={1} />
                <Row justify="center">
                    <Button color={'warning'} onClick={handleClickOrder}>
                        ?????t h??ng
                    </Button>
                </Row>
            </Grid>
            {!cart.id ? (
                <Grid
                    xs={12}
                    sm={5}
                    css={{ backgroundColor: '#fafafa', h: '100vh' }}
                    alignItems="center"
                    justify="center"
                >
                    <Loading size="xl" type="gradient" color={'warning'} />
                </Grid>
            ) : (
                <Grid xs={12} sm={5} direction="column" css={{ backgroundColor: '#fafafa', boxShadow: '1px 0 0 #e1e1e1 inset' }}>
                    <Row justify="flex-end">
                        <Button onClick={backCart} size={'lg'} light color={'primary'}>
                            Quay l???i gi??? h??ng
                        </Button>
                    </Row>
                    <Divider />
                    {cart.items?.map((cartItem) => (
                        <Row key={cartItem.itemId} justify="space-between">
                            <Grid>
                                <Image autoResize objectFit="contain" width={100} height={100} src={cartItem.image} />
                            </Grid>

                            <Col>
                                <Row css={{ marginTop: '$5' }}>{cartItem.name}</Row>
                                <Row align="center">
                                    <Text size={18}>S??? l?????ng: {cartItem.quantity} /</Text>
                                    <Text size={18} css={{ marginLeft: '$2', marginRight: '$2' }}>
                                        Size: {cartItem.size} / M??u:{' '}
                                    </Text>
                                    <span
                                        className={classNames(
                                            'z-10 h-5 w-5 border border-black border-opacity-10 rounded-full',
                                        )}
                                        style={{ backgroundColor: cartItem.color }}
                                    ></span>
                                </Row>
                                <Row>
                                    <Text css={{ marginRight: '$10' }} size={20}>
                                        {formatPrice(cartItem.subPrice)}
                                    </Text>
                                </Row>
                            </Col>
                        </Row>
                    ))}
                    <Divider />
                    <Row gap={2}>
                        <Col>
                            <Text size={'$2xl'}>T???m t??nh:</Text>
                        </Col>
                        <Col offset={5}>
                            <Text size={'$2xl'}>{formatPrice(cart.totalPrice)}</Text>
                        </Col>
                    </Row>
                    <Row gap={2} justify="center">
                        <Col>
                            <Text size={'$xl'}>Ph?? v???n chuy???n:</Text>
                        </Col>
                        <Col offset={5}>
                            <Text size={'$xl'}>{formatPrice(shippingFee)}</Text>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gap={2}>
                        <Col>
                            <Text size={'$3xl'}>T???ng c???ng:</Text>
                        </Col>
                        <Col offset={5}>
                        <Text size={'$3xl'}>{formatPrice(cart.totalPrice + shippingFee)}</Text>
                        </Col>
                    </Row>
                </Grid>
            )}
            <ToastContainer />
        </Grid.Container>
    );
}
export default Order;
