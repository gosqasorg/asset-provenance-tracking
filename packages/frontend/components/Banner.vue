<template>
    <div>
        <slot></slot>
    </div>
</template>

<style scoped>
.banner {
    border-width: 2px;
    border-style: solid;
    border-radius: 10px;
    padding: 10px 20px;
    margin: 0px;
    font-size: 14px;
}

.offline-banner {
    background-color: #FF383C24;
    border-color: #fe9c9e;
}

.online-banner {
    background-color: #00DC8224;
    border-color: #80edc0;
}

@media (prefers-color-scheme: dark) {
    .banner {
        color: white;
    }
}

@media (prefers-color-scheme: light) {
    .banner {
        color: black;
    }
}
</style>
