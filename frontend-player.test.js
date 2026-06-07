import { describe, expect, test } from 'vitest';
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

        expect(trackEntries.length).toBe(7);
        expect(appJs.includes(`let currentTrackIdx = 0;`)).toBe(true);
        expectedTracks.forEach((trackName) => {
            expect(appJs.includes(`name: '${trackName}'`)).toBe(true);
        });
        expect(appJs.indexOf(`name: 'Schoolgirl byebye - 爱是'`) < appJs.indexOf(`let currentTrackIdx = 0;`)).toBe(true);
        expect(appJs.includes(`src: 'assets/love_is.mp3'`)).toBe(true);
        expect(appJs.includes("item.className = 'playlist-item' + (index === currentTrackIdx ? ' active' : '')")).toBe(false);
        expect(appJs.includes('window.MemoryMusicPlayer.init')).toBe(true);
        expect(readFileSync(new URL('./frontend-modules/music-player.js', import.meta.url), 'utf8').includes('item.textContent = `${index + 1}. ${track.name}`')).toBe(true);
    });

    test('allows the full dropdown to escape the player info area and shadows the active track', () => {
        const trackInfoRule = stylesCss.match(/\.track-info\s*\{[^}]+\}/)?.[0] || '';
        const activeRule = stylesCss.match(/\.playlist-item\.active\s*\{[^}]+\}/)?.[0] || '';

        expect(trackInfoRule.includes('overflow: visible')).toBe(true);
        expect(activeRule.includes('box-shadow')).toBe(true);
    });

    test('keeps the vertical volume slider high at the top and low at the bottom', () => {
        const volumeSliderRule = stylesCss.match(/\.volume-slider\s*\{[^}]+\}/)?.[0] || '';

        expect(volumeSliderRule.includes('writing-mode: vertical-lr')).toBe(true);
        expect(volumeSliderRule.includes('direction: rtl')).toBe(true);
    });

    test('does not autoplay or install global unlock listeners', () => {
        const audioTag = indexHtml.match(/<audio[^>]+id="audioSource"[^>]*>/)?.[0] || '';

        expect(audioTag.includes('autoplay')).toBe(false);
        expect(appJs.includes('function startAutoplay()')).toBe(false);
        expect(appJs.includes("document.addEventListener('pointerdown', startAutoplay)")).toBe(false);
        expect(appJs.includes("document.addEventListener('click', startAutoplay)")).toBe(false);
        const musicPlayerJs = readFileSync(new URL('./frontend-modules/music-player.js', import.meta.url), 'utf8');
        expect(musicPlayerJs.includes(`audioSource.addEventListener('play'`)).toBe(true);
        expect(musicPlayerJs.includes(`audioSource.addEventListener('pause'`)).toBe(true);
    });
});

describe('anniversary companion panel', () => {
    test('renders birthday and anniversary countdown fields next to the counter card', () => {
        expect(indexHtml.includes('anniversary-layout')).toBe(true);
        expect(indexHtml.includes('milestone-card')).toBe(true);
        expect(indexHtml.includes('nextBirthdayName')).toBe(true);
        expect(indexHtml.includes('nextBirthdayDays')).toBe(true);
        expect(indexHtml.includes('nextAnniversaryDays')).toBe(true);
        expect(appJs.includes("date: '2004-06-23'")).toBe(true);
        expect(appJs.includes("date: '2002-11-28'")).toBe(true);
        expect(appJs.includes('function getNextAnnualDate')).toBe(true);
        expect(appJs.includes('function updateMilestoneCard')).toBe(true);
    });

    test('stacks the milestone panel below the counter on mobile', () => {
        const layoutRule = stylesCss.match(/\.anniversary-layout\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.anniversary-layout\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        expect(layoutRule.includes('display: grid')).toBe(true);
        expect(layoutRule.includes('grid-template-columns')).toBe(true);
        expect(mobileBlock.includes('grid-template-columns: 1fr')).toBe(true);
    });

    test('keeps default anniversary values when cloud config is empty', () => {
        expect(appJs.includes('const cloudConfig = configResult.config || {};')).toBe(true);
        expect(appJs.includes('partnerName = cloudConfig.partnerName || partnerName;')).toBe(true);
        expect(appJs.includes('anniversaryStr = cloudConfig.anniversaryDate || anniversaryStr;')).toBe(true);
    });
});

describe('stardew wedding hero scene', () => {
    test('places the wedding screenshot under the names with two huts on each side', () => {
        expect(existsSync(new URL('./assets/stardew_wedding.png', import.meta.url))).toBe(true);
        expect(existsSync(new URL('./assets/junimo_hut.png', import.meta.url))).toBe(true);
        expect(indexHtml.includes('stardew-wedding-scene')).toBe(true);
        expect(indexHtml.includes('assets/stardew_wedding.png')).toBe(true);
        expect(indexHtml.split('assets/junimo_hut.png').length - 1).toBe(4);
    });

    test('keeps the wedding scene responsive on mobile', () => {
        const sceneRule = stylesCss.match(/\.stardew-wedding-scene\s*\{[^}]+\}/)?.[0] || '';
        const imageRule = stylesCss.match(/\.stardew-wedding-frame img\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.stardew-wedding-scene\s*\{[\s\S]+?\n    \}[\s\S]+?\.stardew-hut-side\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        expect(sceneRule.includes('display: grid')).toBe(true);
        expect(imageRule.includes('image-rendering: pixelated')).toBe(true);
        expect(mobileBlock.includes('grid-template-columns: 1fr')).toBe(true);
        expect(mobileBlock.includes('display: flex')).toBe(true);
    });

    test('lets the hero grow with the wedding scene and photo wall content', () => {
        const heroRule = stylesCss.match(/\.hero-section\s*\{[^}]+\}/)?.[0] || '';
        const heroContentRule = stylesCss.match(/\.hero-content\s*\{[^}]+\}/)?.[0] || '';
        const scrollArrowRule = stylesCss.match(/\.scroll-down-arrow\s*\{[^}]+\}/)?.[0] || '';
        const timelineRule = stylesCss.match(/#timeline\s*\{[^}]+\}/)?.[0] || '';

        expect(heroRule.includes('height: auto')).toBe(true);
        expect(heroRule.includes('min-height: 100vh')).toBe(true);
        expect(heroRule.includes('justify-content: flex-start')).toBe(true);
        expect(heroRule.includes('padding: 110px 20px 36px')).toBe(true);
        expect(heroContentRule.includes('padding-top: 0')).toBe(true);
        expect(scrollArrowRule.includes('position: absolute')).toBe(false);
        expect(scrollArrowRule.includes('margin-top: 12px')).toBe(true);
        expect(timelineRule.includes('margin-top: 48px')).toBe(true);
    });
});

describe('freeform memory photo wall', () => {
    test('renders an independent memory photo wall between hero and timeline', () => {
        const heroIndex = indexHtml.indexOf('id="hero"');
        const wallIndex = indexHtml.indexOf('id="photo-wall"');
        const timelineIndex = indexHtml.indexOf('id="timeline"');

        expect(wallIndex > heroIndex).toBe(true);
        expect(timelineIndex > wallIndex).toBe(true);
        expect(indexHtml.includes('<a href="#photo-wall">照片墙</a>')).toBe(true);
        expect(indexHtml.includes('memory-wall-stage')).toBe(true);
        expect(appJs.includes('let photoWallPhotos = []')).toBe(true);
        expect(appJs.includes('function renderPhotoWall')).toBe(true);
        expect(appJs.includes('window.MemoryCloudApi.getPhotoWall()')).toBe(true);
        expect(appJs.includes('function collectPhotoWallImages')).toBe(false);
        expect(appJs.includes('renderPhotoWall();')).toBe(true);
    });

    test('uses free scattered desktop layout and a two-column mobile layout', () => {
        const wallRule = stylesCss.match(/\.memory-wall-stage\s*\{[^}]+\}/)?.[0] || '';
        const desktopPhotoRule = stylesCss.match(/\.memory-wall-photo\s*\{[^}]+\}/)?.[0] || '';
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.memory-wall-stage\s*\{[\s\S]+?\n    \}[\s\S]+?\.memory-wall-photo\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        expect(wallRule.includes('position: relative')).toBe(true);
        expect(desktopPhotoRule.includes('position: absolute')).toBe(true);
        expect(mobileBlock.includes('grid-template-columns: repeat(2, minmax(0, 1fr))')).toBe(true);
        expect(mobileBlock.includes('position: relative')).toBe(true);
    });

    test('does not stretch mobile photo cards into tall grid rows', () => {
        const mobileBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?\.memory-wall-stage\s*\{[\s\S]+?\n    \}[\s\S]+?\.memory-wall-photo\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        expect(mobileBlock.includes('align-items: start')).toBe(true);
        expect(mobileBlock.includes('align-self: start')).toBe(true);
        expect(mobileBlock.includes('height: fit-content')).toBe(true);
        expect(appJs.includes("const isCompactPhotoWall = window.matchMedia('(max-width: 900px)').matches;")).toBe(true);
        expect(appJs.includes('memoryPhotoWall.style.minHeight = isCompactPhotoWall')).toBe(true);
    });
});

describe('moment image ratios', () => {
    test('sizes beautiful moment images from their natural image ratio', () => {
        expect(appJs.includes('function applyNaturalImageRatio')).toBe(true);
        expect(appJs.includes("wrapper.style.setProperty('--ratio', naturalRatio);")).toBe(true);
        expect(appJs.includes("const imgEls = card.querySelectorAll('.moment-img-wrapper img');")).toBe(true);
        expect(appJs.includes("imgEl.addEventListener('load', () => applyNaturalImageRatio(imgEl), { once: true });")).toBe(true);
        expect(stylesCss.includes('aspect-ratio: var(--ratio, 4 / 3);')).toBe(true);
        expect(stylesCss.includes('object-fit: cover;')).toBe(true);
        expect(stylesCss.includes('max-height: none;')).toBe(true);
    });
});

describe('cloud content lifecycle', () => {
    test('does not restore generated placeholder content after cloud data is empty', () => {
        expect(appJs.includes('const defaultNotes = [];')).toBe(true);
        expect(appJs.includes('const defaultMoments = [];')).toBe(true);
        expect(appJs.includes('const defaultTimeline = [];')).toBe(true);
        expect(appJs.includes('const defaultPhotoWall = [];')).toBe(true);
        expect(appJs.includes('notes = notesResult.notes.map(n => ({')).toBe(true);
        expect(appJs.includes('moments = momentsResult.moments;')).toBe(true);
        expect(appJs.includes('timelineData = timelineResult.timeline;')).toBe(true);
        expect(appJs.includes('photoWallPhotos = photoWallResult.photos;')).toBe(true);
        expect(appJs.includes(': defaultNotes')).toBe(false);
        expect(appJs.includes(': defaultMoments')).toBe(false);
        expect(appJs.includes(': defaultTimeline')).toBe(false);
        expect(appJs.includes(': defaultPhotoWall')).toBe(false);
    });

    test('defines a stable mobile light background instead of relying on inherited dark defaults', () => {
        const mobileLightBlock = stylesCss.match(/@media \(max-width: 900px\)\s*\{[\s\S]+?body\.light-theme\s*\{[\s\S]+?\n    \}[\s\S]+?body\.light-theme #particleCanvas\s*\{[\s\S]+?\n    \}/)?.[0] || '';

        expect(mobileLightBlock.includes('background-color: #fdf6f0')).toBe(true);
        expect(mobileLightBlock.includes('background-image: linear-gradient')).toBe(true);
        expect(mobileLightBlock.includes('opacity: 0.45')).toBe(true);
    });

    test('prevents mobile browsers from auto-darkening light theme surfaces', () => {
        expect(stylesCss.includes('color-scheme: light;')).toBe(true);
        expect(stylesCss.includes('body.light-theme .navbar')).toBe(true);
        expect(stylesCss.includes('body.light-theme .music-player')).toBe(true);
        expect(stylesCss.includes('body.light-theme .corkboard')).toBe(true);
        expect(stylesCss.includes('background: rgba(255, 255, 255, 0.92)')).toBe(true);
        expect(stylesCss.includes('background: rgba(255, 250, 246, 0.86)')).toBe(true);
    });
});
