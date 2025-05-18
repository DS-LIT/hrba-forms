export default () => ({
    'strapi-plugin-pdf-creator': {
        enabled: true,
        config: {
            beautifyDate: {
                fields: ['date'], // name of fields that will be changed
                options: { // check JS toLocaleDateString options for details
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
            }
        }
    },
    'email': {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: 'smtp.office365.com',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                secure: false,
            },
            settings: {
                defaultFrom: process.env.EMAIL_USER,
                defaultReplyTo: process.env.EMAIL_USER,
            },
        },
    },

});
