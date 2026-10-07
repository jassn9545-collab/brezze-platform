<?php

return [
    'privacy' => [
        'updated_at' => '2026-10-07',
        'title' => 'Your privacy is our priority.',
        'intro' => 'This Privacy Policy explains how Our Bezzie collects, uses, shares, and protects your personal information when you use our marketplace and professional services.',
        'sections' => [
            [
                'title' => 'Information We Collect',
                'paragraphs' => [
                    'We collect account and profile details such as your name, email address, phone number, profile photo, address, and the information you provide for identity or provider verification.',
                    'We collect job, service, booking, payment-status, review, support, and in-app communication information needed to operate the marketplace. Card details are processed by our payment provider and are not stored in full by Our Bezzie.',
                    'We may collect device, diagnostic, and usage information so we can keep the app reliable, prevent abuse, and improve the experience.',
                ],
            ],
            [
                'title' => 'How We Use Information',
                'paragraphs' => [
                    'We use your information to create and secure your account, connect customers with providers, process service activity and payments, deliver notifications, and respond to support requests.',
                    'We also use relevant information to prevent fraud, enforce our terms, comply with legal obligations, and improve our products and services.',
                ],
            ],
            [
                'title' => 'How We Share Information',
                'paragraphs' => [
                    'We share only the information needed for customers and providers to arrange and complete a service. We may also share information with trusted infrastructure, communications, verification, analytics, and payment partners acting on our behalf.',
                    'We may disclose information when required by law, to protect users and the platform, or as part of a business transaction subject to appropriate safeguards.',
                ],
            ],
            [
                'title' => 'Security and Retention',
                'paragraphs' => [
                    'We use reasonable administrative, technical, and organizational safeguards. No system is completely secure, so please use a strong password and contact us if you suspect unauthorized activity.',
                    'We retain information only as long as needed for the purposes described here, including legal, accounting, dispute-resolution, and safety requirements.',
                ],
            ],
            [
                'title' => 'Your Choices and Rights',
                'paragraphs' => [
                    'Depending on your location, you may have rights to access, correct, delete, restrict, or obtain a copy of certain personal information. Some data may need to be retained where the law or an active transaction requires it.',
                ],
            ],
        ],
        'rights' => [
            [
                'title' => 'Access & Portability',
                'description' => 'Request a copy of the personal information associated with your account.',
            ],
            [
                'title' => 'Correction & Deletion',
                'description' => 'Update inaccurate information or request deletion where applicable.',
            ],
        ],
        'contact_email' => env('PRIVACY_CONTACT_EMAIL', 'support@ourbezzie.com'),
    ],
];
