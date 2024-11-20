import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper,
  styled,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Theme } from "@mui/material/styles";

const StyledDropZone = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFiles'
})<{ isDragActive?: boolean; hasFiles?: boolean }>(
  ({ theme, isDragActive, hasFiles }) => ({
    border: `2px dashed ${
      isDragActive 
        ? theme.palette.primary.main 
        : hasFiles 
        ? theme.palette.success.main 
        : theme.palette.grey[400]
    }`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive 
      ? alpha(theme.palette.primary.main, 0.08) 
      : theme.palette.background.paper,
    transition: theme.transitions.create([
      'border-color',
      'background-color'
    ]),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  })
);

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%', 
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const PreviewImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 8,
});

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  opacity: 0,
  transition: theme.transitions.create('opacity'),
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
  '&.delete-button': {
    zIndex: 1,
  },
}));

function alpha(color: string, value: number) {
  return color + Math.round(value * 255).toString(16).padStart(2, '0');
}

interface FileData {
  file: File;
  preview: string;
  id: string;
}

interface MultiFileDropZoneProps {
  files?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  clearFilesTrigger?: boolean; 
}

export const MultiFileDropZone = ({
  onChange,
  maxFiles = 15,
  clearFilesTrigger = false 
}: MultiFileDropZoneProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (files.length + validFiles.length > maxFiles) {
      alert(`Você pode enviar no máximo ${maxFiles} arquivos.`);
      return;
    }

    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      validFiles.forEach(file => {
        if (updatedFiles.length < maxFiles) {
          updatedFiles.push({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(7)
          });
        }
      });
      
      if (onChange) {
        onChange(updatedFiles.map(fileData => fileData.file));
      }
      
      return updatedFiles;
    });
  };

  const handleDelete = (id: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== id);
      const fileToDelete = prevFiles.find(file => file.id === id);
      if (fileToDelete) {
        URL.revokeObjectURL(fileToDelete.preview);
      }
      
      if (onChange) {
        onChange(updatedFiles.map(fileData => fileData.file));
      }
      
      return updatedFiles;
    });
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
    handleFileChange(e.dataTransfer.files);
  }, []);

  useEffect(() => {
    return () => {
      files.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (clearFilesTrigger) {
      setFiles([]);
      if (onChange) {
        onChange([]);
      }
    }
  }, [clearFilesTrigger, onChange]);

  return (
    <Box sx={{ width: '100%' }}>
      <StyledDropZone
        elevation={0}
        isDragActive={isDragActive}
        hasFiles={files.length > 0}
        onClick={() => inputFileRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {files.length === 0 ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" color="primary">
                Arraste imagens ou clique para selecionar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suporta: JPG, PNG (máximo {maxFiles} arquivos)
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {files.length} arquivo(s) selecionado(s) - Arraste mais ou clique para adicionar
            </Typography>
          )}
        </Box>
      </StyledDropZone>

      {files.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {files.map(({ preview, id }) => (
            <Grid size={{sm: 2, xs: 4, md: 2}} key={id}>
              <PreviewContainer>
                <PreviewImage src={preview} alt="Preview" />
                <DeleteButton
                  size="small"
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </DeleteButton>
              </PreviewContainer>
            </Grid>
          ))}
        </Grid>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputFileRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </Box>
  );
};

export default MultiFileDropZone;
