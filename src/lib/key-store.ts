import {createMMKV} from 'react-native-mmkv'

export const store = createMMKV({
    id: "key-store",
    encryptionKey: 'hunter2',
    encryptionType: 'AES-256',
    mode: 'multi-process' as const,
    readOnly: false as const,
    compareBeforeSet: false as const,
})