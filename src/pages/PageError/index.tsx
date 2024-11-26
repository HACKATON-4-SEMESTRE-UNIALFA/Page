import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/ambientes');
    };

    return (
        <Container>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                textAlign="center"
            >
                <Typography variant="h1" component="div" gutterBottom>
                    <strong>404</strong>
                </Typography>
                <Typography variant="h5" component="div" gutterBottom>
                    Página Não Encontrada ou Você não Tem Permissão para Acessar
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Desculpe, a página que você está procurando não existe.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleGoHome}>
                    Voltar para a Página Inicial
                </Button>
            </Box>
        </Container>
    );
};

export default PageNotFound;
