<!-- 
 Redirection page for users auto-verify link contained in their emails. 
 Redirects user to their record  history page if the token and code are valid, 
 otherwise redirects to home page. 
-->

<script setup lang="ts">
import { getPendingVerification } from '../services/azureFuncs';

const route = useRoute();

onMounted(async () => {
    const token = route.query.token as string;
    const code = route.query.code as string;

    // if either token or code is missing, redirect to home
    if (!token || !code) {
        await navigateTo('/', { replace: true });
        return;
    }

    const recordKey = await getPendingVerification(token);
    await navigateTo(
        recordKey ? `/history/${recordKey}?token=${token}&code=${code}` : '/',
        { replace: true }
    );
});
</script>

<template>
    <div>
    </div>
</template>