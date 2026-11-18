import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';

export function useAuth() {
    const isAuthenticated = ref(false);
    const user = ref(null);
    const storage = useStorage('user');

    const login = (userData) => {
        isAuthenticated.value = true;
        user.value = userData;
        storage.value = JSON.stringify(userData);
    };

    const logout = () => {
        isAuthenticated.value = false;
        user.value = null;
        storage.value = null;
    };

    // 检查本地存储中是否有用户信息，如果有则自动登录
    if (storage.value != null && storage.value !== 'null' && storage.value !== 'undefined') {
        isAuthenticated.value = true;
        user.value = JSON.parse(storage.value);
    }

    // 是否管理员
    const isAdmin = computed(() => user.value && user.value.role === 'admin');

    // 是否游客
    const isVisitor = computed(() => user.value && (user.value.role === 'visitor' || !user.value.role));

    return {
        isAuthenticated,
        user,
        login,
        logout,
        isAdmin,
        isVisitor,
    };
}

// 别名导出，兼容 UnityInteraction 的引用
export { useAuth as useUnityAuth };
