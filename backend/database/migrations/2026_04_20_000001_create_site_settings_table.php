<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('group')->default('general'); // general, about, contact, faq, horoscope
            $table->string('type')->default('text');     // text, textarea, json, boolean
            $table->timestamps();
        });

        // Seed default settings
        $defaults = [
            // ── General / Contact Info ───────────────────────────
            ['key' => 'contact_email',    'value' => 'support@astro.in',    'group' => 'contact', 'type' => 'text'],
            ['key' => 'contact_phone',    'value' => '+91 98765 43210',      'group' => 'contact', 'type' => 'text'],
            ['key' => 'contact_hours',    'value' => '24/7 Support Available','group' => 'contact', 'type' => 'text'],
            ['key' => 'contact_location', 'value' => 'New Delhi, India',     'group' => 'contact', 'type' => 'text'],
            ['key' => 'social_instagram', 'value' => '#',                    'group' => 'contact', 'type' => 'text'],
            ['key' => 'social_youtube',   'value' => '#',                    'group' => 'contact', 'type' => 'text'],
            ['key' => 'social_twitter',   'value' => '#',                    'group' => 'contact', 'type' => 'text'],
            ['key' => 'social_facebook',  'value' => '#',                    'group' => 'contact', 'type' => 'text'],

            // ── About Page ───────────────────────────────────────
            ['key' => 'about_hero_title',  'value' => 'Bringing Ancient Wisdom to Modern Life', 'group' => 'about', 'type' => 'text'],
            ['key' => 'about_hero_desc',   'value' => "Astro is India's trusted platform connecting seekers with verified Vedic astrologers. We believe everyone deserves clear guidance — rooted in tradition, delivered with care.", 'group' => 'about', 'type' => 'textarea'],
            ['key' => 'about_mission',     'value' => "We started Astro with a simple belief: everyone deserves access to authentic astrological guidance — not just the privileged few. Our platform brings together India's most trusted astrologers and makes their wisdom accessible, affordable, and instant.\n\nEvery astrologer on our platform is personally verified, background-checked, and rated by real users. No fake profiles, no paid promotions — just genuine expertise.", 'group' => 'about', 'type' => 'textarea'],
            ['key' => 'about_founded',     'value' => 'Founded in 2024 · India',               'group' => 'about', 'type' => 'text'],
            ['key' => 'about_stats',       'value' => json_encode([
                ['value' => '500+',  'label' => 'Verified Astrologers'],
                ['value' => '50K+',  'label' => 'Happy Users'],
                ['value' => '4.8★',  'label' => 'Average Rating'],
                ['value' => '24/7',  'label' => 'Available'],
            ]), 'group' => 'about', 'type' => 'json'],
            ['key' => 'about_team', 'value' => json_encode([
                ['name' => 'Rajesh Kumar', 'role' => 'Founder & CEO',      'expertise' => 'Vedic Astrology, 15 yrs'],
                ['name' => 'Priya Sharma', 'role' => 'Head of Astrologers', 'expertise' => 'KP System, 12 yrs'],
                ['name' => 'Amit Verma',   'role' => 'Technology Head',     'expertise' => 'Astro-tech, 8 yrs'],
            ]), 'group' => 'about', 'type' => 'json'],

            // ── FAQ ──────────────────────────────────────────────
            ['key' => 'faq_items', 'value' => json_encode([
                ['category' => 'Getting Started', 'items' => [
                    ['q' => 'What is Astro?', 'a' => 'Astro is an online platform where you can connect with verified Vedic astrologers through chat, call, or video call. Available 24/7 with genuine experts.'],
                    ['q' => 'How can I create an account?', 'a' => 'Click on the Register button on the homepage. Enter your name, email, and password. Your account will be created instantly.'],
                    ['q' => 'Is this platform free?', 'a' => 'Registration and browsing astrologers are completely free. For consultations, charges are based on the astrologer\'s per-minute rate.'],
                ]],
                ['category' => 'Consultation Process', 'items' => [
                    ['q' => 'How can I talk to an astrologer?', 'a' => 'Go to the Astrologers page, choose your preferred astrologer, view their profile, and click Talk Now (if online).'],
                    ['q' => 'What communication modes are available?', 'a' => 'Depending on the astrologer\'s setup, Chat, Voice Call, or Video Call options are available.'],
                    ['q' => 'What if the astrologer is offline?', 'a' => 'You can view their profile, read reviews, and connect when they come online. Use the Online Only filter to see available astrologers.'],
                ]],
                ['category' => 'Privacy & Safety', 'items' => [
                    ['q' => 'Are my conversations private?', 'a' => 'Yes, absolutely. Your consultations are 100% private and no third party can access your conversations.'],
                    ['q' => 'Are astrologers verified?', 'a' => 'Yes. All astrologers go through ID and experience verification before joining the platform.'],
                ]],
            ]), 'group' => 'faq', 'type' => 'json'],

            // ── Horoscope predictions ────────────────────────────
            ['key' => 'horoscope_predictions', 'value' => json_encode([
                'Aries'       => ['love' => 'A romantic opportunity may come your way. Stay open to connection.', 'career' => 'Confidence will help you land a new project.', 'health' => 'Yoga or light exercise will keep your energy balanced.', 'lucky' => 'Red · 9 · Tuesday'],
                'Taurus'      => ['love' => 'Patience in relationships will bring stability and deeper trust.', 'career' => 'Avoid risky financial decisions. Steady progress is better.', 'health' => 'Watch your diet. Neck and shoulder tension is possible.', 'lucky' => 'Green · 6 · Friday'],
                'Gemini'      => ['love' => 'Open communication will resolve a recent misunderstanding.', 'career' => 'Teamwork brings results. New professional connections are likely.', 'health' => 'Prioritize good sleep and manage stress proactively.', 'lucky' => 'Yellow · 5 · Wednesday'],
                'Cancer'      => ['love' => 'Share your feelings openly — your bond will deepen.', 'career' => 'A creative work-from-home opportunity may appear.', 'health' => 'Stay hydrated. Watch for digestive sensitivity.', 'lucky' => 'White · 2 · Monday'],
                'Leo'         => ['love' => 'Speak from the heart — your partner is listening closely.', 'career' => 'Leadership shines today. Recognition from superiors is likely.', 'health' => 'Maintain your exercise routine. Focus on heart health.', 'lucky' => 'Gold · 1 · Sunday'],
                'Virgo'       => ['love' => 'Small thoughtful gestures will mean a lot to your partner.', 'career' => 'Detail-oriented work will be highly productive.', 'health' => 'Digestive health needs attention. Eat more greens.', 'lucky' => 'Grey · 5 · Wednesday'],
                'Libra'       => ['love' => 'Make decisions together — partnership and balance are key.', 'career' => 'Diplomatic skills will help you succeed in negotiations.', 'health' => 'Pay attention to your lower back and kidney health.', 'lucky' => 'Pink · 6 · Friday'],
                'Scorpio'     => ['love' => 'Deeper conversations will build understanding and lasting trust.', 'career' => 'Research and investigative work will be very productive.', 'health' => 'Mental wellness is important. Practice mindfulness.', 'lucky' => 'Maroon · 8 · Tuesday'],
                'Sagittarius' => ['love' => 'Shared adventures will strengthen your relationship.', 'career' => 'Opportunities related to travel or education may arise.', 'health' => 'Take care of your hips and thighs with stretching.', 'lucky' => 'Purple · 3 · Thursday'],
                'Capricorn'   => ['love' => 'Long-term commitment grows stronger through consistent effort.', 'career' => 'Hard work pays off today. Seniors may take notice.', 'health' => 'Joint and bone health deserves attention. Stay active.', 'lucky' => 'Brown · 8 · Saturday'],
                'Aquarius'    => ['love' => 'Introduce something new into your relationship to keep it fresh.', 'career' => 'Technology and unconventional thinking will give you an edge.', 'health' => 'Focus on circulation. A brisk walk will do you good.', 'lucky' => 'Blue · 4 · Saturday'],
                'Pisces'      => ['love' => 'Trust your intuition. Express your feelings openly and honestly.', 'career' => 'Creative projects thrive today. Let your imagination lead.', 'health' => 'Rest is essential. Take care of your feet.', 'lucky' => 'Sea Green · 7 · Thursday'],
            ]), 'group' => 'horoscope', 'type' => 'json'],

            // ── Privacy & Terms ──────────────────────────────────
            ['key' => 'privacy_content', 'value' => json_encode([
                ['title' => 'Information We Collect', 'content' => "We only collect information necessary to provide our services:\n• Account information: name, email address, password (encrypted)\n• Usage data: consultation history\n• Payment information: handled securely by payment processors — we do not store card details"],
                ['title' => 'How We Use Your Information', 'content' => "Your information is used only for:\n• To manage your account and provide consultations\n• To maintain platform security\n• We never sell your data to advertisers"],
                ['title' => 'Data Security', 'content' => "• All data is transmitted using SSL/TLS encryption\n• Passwords are stored using secure bcrypt hashing\n• Consultations are end-to-end encrypted"],
                ['title' => 'Your Rights', 'content' => "• Right to access your data\n• Right to correct inaccurate information\n• Right to delete your account\n• Contact us at support@astro.in"],
            ]), 'group' => 'privacy', 'type' => 'json'],

            ['key' => 'terms_content', 'value' => json_encode([
                ['title' => 'Platform Usage', 'content' => "• You must be at least 18 years of age\n• One person is allowed only one account\n• You must provide accurate information"],
                ['title' => 'Consultation Disclaimer', 'content' => "• Astrology is a belief system and not a scientific discipline\n• Astrologers are not licensed professionals\n• Consultation content should not be treated as professional advice"],
                ['title' => 'Payments & Refunds', 'content' => "• Consultations are charged per minute\n• In case of technical issues from our side, a refund will be provided\n• Refund disputes must be reported within 7 days"],
                ['title' => 'Prohibited Conduct', 'content' => "• Harassing astrologers or using inappropriate language\n• Posting fake reviews\n• Making payments outside the platform"],
            ]), 'group' => 'terms', 'type' => 'json'],
        ];

        DB::table('site_settings')->insert(array_map(function($item) {
            return array_merge($item, ['created_at' => now(), 'updated_at' => now()]);
        }, $defaults));
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
