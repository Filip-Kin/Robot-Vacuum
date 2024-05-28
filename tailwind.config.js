/** @type {import('tailwindcss').Config}*/
const config = {
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

    plugins: [require('flowbite/plugin')],

    darkMode: 'class',

    theme: {
        extend: {
            colors: {
                primary: {
                    '50': '#f9f5ff',
                    '100': '#f2e9fe',
                    '200': '#e7d6fe',
                    '300': '#d4b6fc',
                    '400': '#b988f8',
                    '500': '#ac71f4',
                    '600': '#8838e5',
                    '700': '#7427c9',
                    '800': '#6325a4',
                    '900': '#521f84',
                    '950': '#360a61',
                },
            }
        }
    },
};

module.exports = config;