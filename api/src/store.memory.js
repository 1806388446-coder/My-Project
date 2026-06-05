export function createMemoryStore(seed = {}) {
  const config = seed.config ?? { id: 'main', partnerName: '胡珊珊', anniversaryDate: '2024-06-27', updatedAt: new Date(0).toISOString() };
  const notes = [...(seed.notes ?? [])];
  const moments = [...(seed.moments ?? [])];
  const editors = new Map((seed.editors ?? []).map((editor) => [editor.id, editor]));
  const inviteCodes = new Map((seed.inviteCodes ?? []).map((invite) => [invite.id, invite]));
  const timeline = [...(seed.timeline ?? [])];
  const photoWall = [...(seed.photoWall ?? [])];

  return {
    async getConfig() {
      return config;
    },
    async updateConfig(nextConfig) {
      Object.assign(config, nextConfig);
      return config;
    },
    async listNotes() {
      return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async createNote(note) {
      notes.push(note);
      return note;
    },
    async updateNote(id, patch) {
      const note = notes.find((item) => item.id === id);
      if (!note) return null;
      Object.assign(note, patch);
      return note;
    },
    async deleteNote(id) {
      const index = notes.findIndex((item) => item.id === id);
      if (index === -1) return false;
      notes.splice(index, 1);
      return true;
    },
    async listMoments() {
      return [...moments].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    async createMoment(moment) {
      moments.push(moment);
      return moment;
    },
    async updateMoment(id, patch) {
      const moment = moments.find((item) => item.id === id);
      if (!moment) return null;
      Object.assign(moment, patch);
      return moment;
    },
    async deleteMoment(id) {
      const index = moments.findIndex((item) => item.id === id);
      if (index === -1) return false;
      moments.splice(index, 1);
      return true;
    },
    async listTimeline() {
      return [...timeline].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    async createTimeline(item) {
      timeline.push(item);
      return item;
    },
    async updateTimeline(id, patch) {
      const item = timeline.find((t) => t.id === id);
      if (!item) return null;
      Object.assign(item, patch);
      return item;
    },
    async deleteTimeline(id) {
      const index = timeline.findIndex((t) => t.id === id);
      if (index === -1) return false;
      timeline.splice(index, 1);
      return true;
    },
    async listPhotoWall() {
      return [...photoWall].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    async createPhotoWallPhoto(photo) {
      photoWall.push(photo);
      return photo;
    },
    async updatePhotoWallPhoto(id, patch) {
      const photo = photoWall.find((item) => item.id === id);
      if (!photo) return null;
      Object.assign(photo, patch);
      return photo;
    },
    async deletePhotoWallPhoto(id) {
      const index = photoWall.findIndex((item) => item.id === id);
      if (index === -1) return false;
      photoWall.splice(index, 1);
      return true;
    },
    async createEditor(editor) {
      editors.set(editor.id, editor);
      return editor;
    },
    async getEditor(id) {
      return editors.get(id) ?? null;
    },
    async listEditors() {
      return [...editors.values()];
    },
    async revokeEditor(id, revokedAt) {
      const editor = editors.get(id);
      if (!editor) return null;
      editor.status = 'revoked';
      editor.revokedAt = revokedAt;
      return editor;
    },
    async createInvite(invite) {
      inviteCodes.set(invite.id, invite);
      return invite;
    },
    async listInvites() {
      return [...inviteCodes.values()];
    },
    async findUnusedInviteByHash(codeHash) {
      return [...inviteCodes.values()].find((invite) => invite.codeHash === codeHash && invite.status === 'unused') ?? null;
    },
    async updateInvite(id, patch) {
      const invite = inviteCodes.get(id);
      if (!invite) return null;
      Object.assign(invite, patch);
      return invite;
    }
  };
}
