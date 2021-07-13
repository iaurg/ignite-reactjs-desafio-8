import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

type PostImageData = {
  url: string;
};

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: true,
      validate: {
        lessThan10MB: (file: FileList) =>
          file[0].size / 1024 / 1024 < 10 ||
          'O arquivo deve ser menor que 10MB',
        acceptedFormats: (file: FileList) =>
          /\/(jpe?g|png|gif)$/i.test(file[0].type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: true,
      maxLength: 20,
      minLength: 2,
    },
    description: {
      required: true,
      maxLength: 65,
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (data: PostImageData) => api.post('api/images', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
        });
        return;
      }

      mutation.mutateAsync({ url: imageUrl, ...data });

      toast({
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.',
        status: 'success',
      });
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
      });
    } finally {
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          {...register('image', formValidations.image)}
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
        />

        <TextInput
          {...register('title', formValidations.title)}
          placeholder="Título da imagem..."
          error={errors.title}
        />

        <TextInput
          {...register('description', formValidations.description)}
          placeholder="Descrição da imagem..."
          error={errors.description}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
