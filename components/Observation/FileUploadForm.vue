<template>
  <div>
      <label v-if="observation.isDraft" class="block">
        <UInput class="hidden" type="file" :on:change="onFilePicked" />
        <div class="text-sm underline text-green-500 cursor-pointer">
          Upload file
        </div>
      </label>
      <div
        class="text-sm underline text-green-500 cursor-pointer"
        @click="captureVideo"
        v-if="isElectron"
      >
        Capture video
      </div>
      <UTable
        v-show="observation.fileUploads.length > 0"
        class="mt-6"
        :rows="observation.fileUploads"
        :columns="fileUploadColumns"
      >
        <template #mimetype-data="{ row }">
          <div class="w-full h-full items-center justify-center flex">
            <UIcon
              :name="getIconByMimetype(row.mimetype).icon"
              :class="`${getIconByMimetype(row.mimetype).class} text-xl`"
            />
          </div>
        </template>
        <template #originalName-data="{ row }">
          <NuxtLink
            :href="`/api/projects/${project.id}/observations/${observation.id}/upload/${row.id}`"
            target="_blank"
            class="cursor-pointer hover:text-gray-200 transition-colors"
          >
            {{ row.originalName }}
          </NuxtLink>
        </template>
      </UTable>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    onFileUploaded: requireFunctionProp<(file: File) => Promise<void>>(),
    onVideoCaptureUploaded: requireFunctionProp<() => Promise<void>>(),
    observation: requireObservationProp,
    project: requireProjectProp,
  });
  
  const config = useRuntimeConfig().public;
  const file = ref<File | undefined>();
  const toast = useToast();
  const { isElectron } = useDevice();

  const fileUploadColumns = [
    {
      label: '',
      key: 'mimetype',
      sortable: true,
    },
    {
      label: 'File name',
      key: 'originalName',
      sortable: true,
    },
    {
      label: 'Uploaded at',
      key: 'createdAt',
      sortable: true,
    }
  ]

  const {
    uploadObservationFile,
  } = await useObservations(props.project.id);

  async function onFilePicked(event: any) {
    const files = event?.target?.files || [];
    if (files.length == 0) {
      return;
    } else if (files.length > 1) {
      throw new Error('Only one file can be uploaded at a time')
    }

    // ensure size is ok
    if (files[0].size > config.maxFileSize) {
      toast.add({
        title: 'File is too big',
        description: 'Maximum size allowed is ' + formatMb(config.maxFileSize),
        icon: 'i-heroicons-exclamation-triangle',
        color: 'red'
      });
      return;
    }

    file.value = files[0] as File;

    try {
      await uploadObservationFile(
        props.project.id,
        props.observation.id,
        file.value
      ).then(async () => {
        if (typeof props.project?.id !== 'number') {
          throw new Error('Project id is not found')
        }
        await props.onFileUploaded(file.value!);

      }).catch((e: any) => {
        let msg = 'An error occured when uploading image'
        if (e.message) {
          msg = e.message;
        }
        toast.add({
          title: 'File upload error',
          description: msg,
          icon: 'i-heroicons-exclamation-triangle',
          color: 'red'
        });
      })
    } catch(err) {
      console.error('File upload submit error:', err);
      throw err;
    }
  }

  async function captureVideo() {
    if (!isElectron.value) {
      toast.add({
        title: 'Function not available',
        description: 'Video capture can only be called from within the native application',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'red',
      })
    } else {
      window.electronAPI?.beginVideoCapture(
        props.observation.id,
        props.project.id,
        props.onVideoCaptureUploaded,
      );
    }
  }
</script>