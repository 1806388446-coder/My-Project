import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const stylesCss = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

describe('music player playlist', () => {
    test('renders the replacement playlist and starts on 爱是', () => {
        const trackEntries = appJs.match(/\{\s*name:\s*'[^']+'\s*,\s*src:\s*'[^']+'/g) || [];
        const expectedTracks = [
            'Schoolgirl byebye - 爱是',
            '罗言,LSGCsikoriot - 靶心挂在嘴角',
            '夏之禹 - 殉情',
            'deca joins - 夏夜晚风',
            'JVKE - her',
            'moumoon - moonlight-Binaural recording ver.- (acoustic selection -ACOMOON-)',
            'StrawberryPapa - morning flip'
        ];

        assert.equal(trackEntries.length, 7);
        assert.ok(appJs.includes(`let currentTrackIdx = 0;`));
        expectedTracks.forEach((trackName) => {
            assert.ok(appJs.includes(`name: '${trackName}'`));
        });
        assert.ok(appJs.indexOf(`name: 'Schoolgirl byebye - 爱是'`) < appJs.indexOf(`let currentTrackIdx = 0;`));
        assert.ok(appJs.includes(`src: 'assets/love_is.mp3'`));
        assert.ok(appJs.includes("item.className = 'playlist-item' + (index === currentTrackIdx ? ' active' : '')"));
        assert.ok(appJs.includes('item.textContent = `${index + 1}. ${track.name}`'));
    });

    test('allows the full dropdown to escape the player info area and shadows the active track', () => {
        const trackInfoRule = stylesCss.match(/\.track-info\s*\{[^}]+\}/)?.[0] || '';
        const activeRule = stylesCss.match(/\.playlist-item\.active\s*\{[^}]+\}/)?.[0] || '';

        assert.ok(trackInfoRule.includes('overflow: visible'));
        assert.ok(activeRule.includes('box-shadow'));
    });

    test('keeps the vertical volume slider high at the top and low at the bottom', () => {
        const volumeSliderRule = stylesCss.match(/\.volume-slider\s*\{[^}]+\}/)?.[0] || '';

        assert.ok(volumeSliderRule.includes('writing-mode: vertical-lr'));
        assert.ok(volumeSliderRule.includes('direction: rtl'));
    });

    test('does not autoplay or install global unlock listeners', () => {
        const audioTag = indexHtml.match(/<audio[^>]+id="audioSource"[^>]*>/)?.[0] || '';

        assert.ok(!audioTag.includes('autoplay'));
        assert.ok(!appJs.includes('function startAutoplay()'));
        assert.ok(!appJs.includes("document.addEventListener('pointerdown', startAutoplay)"));
        assert.ok(!appJs.includes("document.addEventListener('click', startAutoplay)"));
        assert.ok(appJs.includes(`audioSource.addEventListener('play'`));
        assert.ok(appJs.includes(`audioSource.addEventListener('pause'`));
    });
});

describe('anniversary companion panel', () => {
    test('renders birthday and anniversary countdown fields next to the counter card', () => {
        assert.ok(indexHtml.includes('anniversary-layout'));
        assert.ok(indexHtml.includes('milestone-card'));
        assert.ok(indexHtml.includes('nextBirthdayName'));
        assert.ok(indexHtml.includes('nextBirthdayDays'));
        assert.ok(indexHtml.includes('nextAnniversaryDays'));
        assert.ok(appJs.includes("date: '2004-06-23'"));
        assert.ok(appJs.includes("date: '2002-11-28'"));
        assert.ok(appJs.includes('function getNextAnnualDate'));
        assert.ok(appJs.includes('function updateMilestoneCard'));
    });

    test('stacks the milestone panel below the counter on mobile', () => {
        const layoutRule = stylesCss.match(/\.anniversary-layout\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.anniversary-layout\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        assert.ok(layoutRule.includes('display: grid'));
        assert.ok(layoutRule.includes('grid-template-columns'));
        assert.ok(mobileBlock.includes('grid-template-columns: 1fr'));
    });

    test('keeps default anniversary values when cloud config is empty', () => {
        assert.ok(appJs.includes('const cloudConfig = configResult.config || {};'));
        assert.ok(appJs.includes('partnerName = cloudConfig.partnerName || partnerName;'));
        assert.ok(appJs.includes('anniversaryStr = cloudConfig.anniversaryDate || anniversaryStr;'));
    });
});

describe('stardew wedding hero scene', () => {
    test('places the wedding screenshot under the names with two huts on each side', () => {
        assert.ok(existsSync(new URL('./assets/stardew_wedding.png', import.meta.url)));
        assert.ok(existsSync(new URL('./assets/junimo_hut.png', import.meta.url)));
        assert.ok(indexHtml.includes('stardew-wedding-scene'));
        assert.ok(indexHtml.includes('assets/stardew_wedding.png'));
        assert.equal(indexHtml.split('assets/junimo_hut.png').length - 1, 4);
    });

    test('keeps the wedding scene responsive on mobile', () => {
        const sceneRule = stylesCss.match(/\.stardew-wedding-scene\s*\{[^}]+\}/)?.[0] || '';
        const imageRule = stylesCss.match(/\.stardew-wedding-frame img\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.stardew-wedding-scene\s*\{[\s\S]+?\n    \}[\s\S]+?\.stardew-hut-side\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        assert.ok(sceneRule.includes('display: grid'));
        assert.ok(imageRule.includes('image-rendering: pixelated'));
        assert.ok(mobileBlock.includes('grid-template-columns: 1fr'));
        assert.ok(mobileBlock.includes('display: flex'));
    });

    test('lets the hero grow with the wedding scene and photo wall content', () => {
        const heroRule = stylesCss.match(/\.hero-section\s*\{[^}]+\}/)?.[0] || '';
        const heroContentRule = stylesCss.match(/\.hero-content\s*\{[^}]+\}/)?.[0] || '';
        const scrollArrowRule = stylesCss.match(/\.scroll-down-arrow\s*\{[^}]+\}/)?.[0] || '';
        const timelineRule = stylesCss.match(/#timeline\s*\{[^}]+\}/)?.[0] || '';

        assert.ok(heroRule.includes('height: auto'));
        assert.ok(heroRule.includes('min-height: 100vh'));
        assert.ok(heroRule.includes('justify-content: flex-start'));
        assert.ok(heroRule.includes('padding: 110px 20px 36px'));
        assert.ok(heroContentRule.includes('padding-top: 0'));
        assert.ok(!scrollArrowRule.includes('position: absolute'));
        assert.ok(scrollArrowRule.includes('margin-top: 12px'));
        assert.ok(timelineRule.includes('margin-top: 48px'));
    });
});

describe('freeform memory photo wall', () => {
    test('renders an independent memory photo wall between hero and timeline', () => {
        const heroIndex = indexHtml.indexOf('id="hero"');
        const wallIndex = indexHtml.indexOf('id="photo-wall"');
        const timelineIndex = indexHtml.indexOf('id="timeline"');

        assert.ok(wallIndex > heroIndex);
        assert.ok(timelineIndex > wallIndex);
        assert.ok(indexHtml.includes('<a href="#photo-wall">照片墙</a>'));
        assert.ok(indexHtml.includes('memory-wall-stage'));
        assert.ok(appJs.includes('let photoWallPhotos = []'));
        assert.ok(appJs.includes('function renderPhotoWall'));
        assert.ok(appJs.includes('window.MemoryCloudApi.getPhotoWall()'));
        assert.ok(!appJs.includes('function collectPhotoWallImages'));
        assert.ok(appJs.includes('renderPhotoWall();'));
    });

    test('uses free scattered desktop layout and a two-column mobile layout', () => {
        const wallRule = stylesCss.match(/\.memory-wall-stage\s*\{[^}]+\}/)?.[0] || '';
        const desktopPhotoRule = stylesCss.match(/\.memory-wall-photo\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.memory-wall-stage\s*\{[\s\S]+?\n    \}[\s\S]+?\.memory-wall-photo\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        assert.ok(wallRule.includes('position: relative'));
        assert.ok(desktopPhotoRule.includes('position: absolute'));
        assert.ok(mobileBlock.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'));
        assert.ok(mobileBlock.includes('position: relative'));
    });

    test('does not stretch mobile photo cards into tall grid rows', () => {
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.memory-wall-stage\s*\{[\s\S]+?\n    \}[\s\S]+?\.memory-wall-photo\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        assert.ok(mobileBlock.includes('align-items: start'));
        assert.ok(mobileBlock.includes('align-self: start'));
        assert.ok(mobileBlock.includes('height: fit-content'));
        assert.ok(appJs.includes("const isCompactPhotoWall = window.matchMedia('(max-width: 900px)').matches;"));
        assert.ok(appJs.includes('memoryPhotoWall.style.minHeight = isCompactPhotoWall'));
    });
});

describe('moment image ratios', () => {
    test('sizes beautiful moment images from their natural image ratio', () => {
        assert.ok(appJs.includes('function applyNaturalImageRatio'));
        assert.ok(appJs.includes("wrapper.style.setProperty('--ratio', naturalRatio);"));
        assert.ok(appJs.includes("const imgEls = card.querySelectorAll('.moment-img-wrapper img');"));
        assert.ok(appJs.includes("imgEl.addEventListener('load', () => applyNaturalImageRatio(imgEl), { once: true });"));
        assert.ok(stylesCss.includes('aspect-ratio: var(--ratio, 4 / 3);'));
        assert.ok(stylesCss.includes('object-fit: cover;'));
        assert.ok(stylesCss.includes('max-height: none;'));
    });
});

describe('cloud content lifecycle', () => {
    test('does not restore generated placeholder content after cloud data is empty', () => {
        assert.ok(appJs.includes('const defaultNotes = [];'));
        assert.ok(appJs.includes('const defaultMoments = [];'));
        assert.ok(appJs.includes('const defaultTimeline = [];'));
        assert.ok(appJs.includes('const defaultPhotoWall = [];'));
        assert.ok(appJs.includes('notes = notesResult.notes.map(n => ({'));
        assert.ok(appJs.includes('moments = momentsResult.moments;'));
        assert.ok(appJs.includes('timelineData = timelineResult.timeline;'));
        assert.ok(appJs.includes('photoWallPhotos = photoWallResult.photos;'));
        assert.equal(appJs.includes(': defaultNotes'), false);
        assert.equal(appJs.includes(': defaultMoments'), false);
        assert.equal(appJs.includes(': defaultTimeline'), false);
        assert.equal(appJs.includes(': defaultPhotoWall'), false);
    });

    test('defines a stable mobile light background instead of relying on inherited dark defaults', () => {
        const mobileLightBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?body\.light-theme\s*\{[\s\S]+?\n    \}[\s\S]+?body\.light-theme #particleCanvas\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        assert.ok(mobileLightBlock.includes('background-color: #fdf6f0'));
        assert.ok(mobileLightBlock.includes('background-image: linear-gradient'));
        assert.ok(mobileLightBlock.includes('opacity: 0.45'));
    });

    test('prevents mobile browsers from auto-darkening light theme surfaces', () => {
        assert.ok(stylesCss.includes('color-scheme: light;'));
        assert.ok(stylesCss.includes('body.light-theme .navbar'));
        assert.ok(stylesCss.includes('body.light-theme .music-player'));
        assert.ok(stylesCss.includes('body.light-theme .corkboard'));
        assert.ok(stylesCss.includes('background: rgba(255, 255, 255, 0.92)'));
        assert.ok(stylesCss.includes('background: rgba(255, 250, 246, 0.86)'));
    });
});
