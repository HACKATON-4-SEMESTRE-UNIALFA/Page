import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SetStateAction, useState } from 'react';
import { LayoutDashboard } from '../../components/LayoutDashboard';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PlaceIcon from '@mui/icons-material/Place';
import PublicIcon from '@mui/icons-material/Public';
import { Contato } from './components/Contato';
import { Endereco } from './components/Endereco';
import { Loading } from '../../components/Loading';
import { RedeSocial } from './components/RedeSocial';

export default function Instituicao() {
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(true);


    const handleChange = (event: any, newValue: SetStateAction<number>) => {
        setValue(newValue);
    };

    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs value={value} onChange={handleChange} centered>
                        <Tab value={0} label="Contato" icon={<AccountBoxIcon />} />
                        <Tab value={1} label="Endereço" icon={<PlaceIcon />} />
                        <Tab value={2} label="Rede Social" icon={<PublicIcon />} />
                    </Tabs>
                    {value === 0 && <Contato setLoading={setLoading} />}
                    {value === 1 && <Endereco setLoading={setLoading} />}
                    {value === 2 && <RedeSocial setLoading={setLoading} />}
                </Box>
            </LayoutDashboard>
        </>
    );
}
