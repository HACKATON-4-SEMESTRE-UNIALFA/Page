import { useCallback, useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledDropZone = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFile' && prop !== 'error'
})<{ isDragActive?: boolean; hasFile?: boolean; error?: boolean }>(
    ({ theme, isDragActive, hasFile, error }) => ({
        border: `2px dashed ${
            error ? theme.palette.error.main :
            isDragActive ? theme.palette.primary.main :
            hasFile ? theme.palette.success.main :
            theme.palette.grey[400]
        }`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(3),
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: theme.spacing(2),
        backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
    })
);

const PreviewContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
}));

const FilePreview = styled('img')({
    maxWidth: '200px',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '4px',
});

const DeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
    },
}));

interface DropZoneProps {
    previewUrl: string;
    onFileChange: (file: File | null) => void;
    onDeleteImage: () => void;
    error?: boolean;
}

export const DropZone = ({ previewUrl, onFileChange, onDeleteImage, error }: DropZoneProps) => {
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [hasFile, setHasFile] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            onFileChange(file);
        } else {
            onFileChange(null); 
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    }, []);

    return (
        <>
            <StyledDropZone
                isDragActive={isDragActive}
                hasFile={!!previewUrl}
                error={error}
                onClick={() => inputFileRef.current?.click()} 
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!previewUrl ? (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h6" color="primary">
                            Arraste uma imagem ou clique para selecionar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Suporta: JPG, PNG
                        </Typography>
                    </Box>
                ) : (
                    <PreviewContainer>
                        <FilePreview src={previewUrl} alt="Preview" />
                        <DeleteButton
                            size="small"
                            onClick={(e) => {
                                e.preventDefault();
                                onDeleteImage();
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </DeleteButton>
                    </PreviewContainer>
                )}
            </StyledDropZone>
            <input
                type="file"
                accept="image/*"
                ref={inputFileRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(file);
                }}
            />
        </>
    );
};


export default DropZone;
