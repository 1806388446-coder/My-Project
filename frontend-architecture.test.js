import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const stylesCss = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function readModule(path) {
    return readFileSync(new URL(path, import.meta.url), 'utf8');
}

describe('frontend architecture and feedback experience', () => {
    test('loads focused frontend modules before the app bootstrap', () => {
        expect(indexHtml.includes('frontend-modules/ui-feedback.js')).toBe(true);
        expect(indexHtml.includes('frontend-modules/music-player.js')).toBe(true);
        expect(indexHtml.indexOf('frontend-modules/ui-feedback.js')).toBeLessThan(indexHtml.indexOf('app.js'));
        expect(indexHtml.indexOf('frontend-modules/music-player.js')).toBeLessThan(indexHtml.indexOf('app.js'));
        expect(appJs.includes('window.MemoryFeedback')).toBe(true);
        expect(appJs.includes('window.MemoryMusicPlayer.init')).toBe(true);
    });

    test('uses custom toast and confirm UI instead of blocking browser dialogs', () => {
        const feedbackJs = readModule('./frontend-modules/ui-feedback.js');

        expect(indexHtml.includes('id="toastRegion"')).toBe(true);
        expect(indexHtml.includes('id="confirmDialog"')).toBe(true);
        expect(stylesCss.includes('.toast-region')).toBe(true);
        expect(stylesCss.includes('.confirm-dialog')).toBe(true);
        expect(feedbackJs.includes('showToast')).toBe(true);
        expect(feedbackJs.includes('confirmAction')).toBe(true);
        expect(appJs.includes('alert(')).toBe(false);
        expect(appJs.includes('confirm(')).toBe(false);
    });

    test('moves the music player implementation out of the main app file', () => {
        const musicPlayerJs = readModule('./frontend-modules/music-player.js');

        expect(musicPlayerJs.includes('window.MemoryMusicPlayer')).toBe(true);
        expect(musicPlayerJs.includes('function setTrack')).toBe(true);
        expect(musicPlayerJs.includes('function renderPlaylist')).toBe(true);
        expect(appJs.includes('function setTrack')).toBe(false);
        expect(appJs.includes('function renderPlaylist')).toBe(false);
        expect(appJs.split('\n').length).toBeLessThan(2280);
    });
});
