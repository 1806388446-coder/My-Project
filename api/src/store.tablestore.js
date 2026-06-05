import TableStore from 'tablestore';

function callOts(client, methodName, params) {
  return new Promise((resolve, reject) => {
    client[methodName](params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function parseRow(row) {
  if (!row) return null;
  const result = {};
  if (row.primaryKey) {
    for (const pk of row.primaryKey) {
      result[pk.name] = pk.value;
    }
  }
  if (row.attributes) {
    for (const attr of row.attributes) {
      let val = attr.columnValue;
      if (val && typeof val === 'object' && 'value' in val) {
        val = val.value;
      }
      result[attr.columnName] = val;
    }
  }
  return result;
}

export function createTableStoreStore({ endpoint, instancename, accessKeyId, accessKeySecret }) {
  const client = new TableStore.Client({
    accessKeyId,
    secretAccessKey: accessKeySecret,
    endpoint,
    instancename
  });

  async function getRow(tableName, id) {
    const params = {
      tableName,
      primaryKey: [{ id }]
    };
    const response = await callOts(client, 'getRow', params);
    return parseRow(response.row);
  }

  async function putRow(tableName, id, attributes) {
    const attributeColumns = Object.entries(attributes).map(([key, val]) => {
      return { [key]: val };
    });
    const params = {
      tableName,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
      primaryKey: [{ id }],
      attributeColumns
    };
    await callOts(client, 'putRow', params);
  }

  async function deleteRow(tableName, id) {
    const params = {
      tableName,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
      primaryKey: [{ id }]
    };
    await callOts(client, 'deleteRow', params);
  }

  async function scanTable(tableName) {
    const rows = [];
    let nextStartPrimaryKey = null;
    do {
      const params = {
        tableName,
        direction: TableStore.Direction.FORWARD,
        inclusiveStartPrimaryKey: nextStartPrimaryKey || [{ id: TableStore.INF_MIN }],
        exclusiveEndPrimaryKey: [{ id: TableStore.INF_MAX }],
        limit: 100
      };
      const response = await callOts(client, 'getRange', params);
      if (response.rows && response.rows.length) {
        rows.push(...response.rows.map(parseRow));
      }
      nextStartPrimaryKey = response.nextStartPrimaryKey;
    } while (nextStartPrimaryKey);
    return rows;
  }

  return {
    async getConfig() {
      const config = await getRow('SiteConfig', 'main');
      if (!config?.partnerName || !config?.anniversaryDate) {
        return { id: 'main', partnerName: '胡珊珊', anniversaryDate: '2024-06-27', updatedAt: new Date(0).toISOString() };
      }
      return config;
    },

    async updateConfig(nextConfig) {
      const current = await this.getConfig();
      const merged = { ...current, ...nextConfig };
      delete merged.id; // Primary key should not be in attributes
      await putRow('SiteConfig', 'main', merged);
      return { id: 'main', ...merged };
    },

    async listNotes() {
      const notes = await scanTable('Notes');
      return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async createNote(note) {
      const noteData = { ...note };
      delete noteData.id;
      await putRow('Notes', note.id, noteData);
      return note;
    },

    async deleteNote(id) {
      await deleteRow('Notes', id);
      return true;
    },

    async listMoments() {
      const rows = await scanTable('Moments');
      const moments = rows.map((m) => {
        if (m.images && typeof m.images === 'string') {
          try {
            m.images = JSON.parse(m.images);
          } catch {
            m.images = [];
          }
        }
        return m;
      });
      return moments.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },

    async createMoment(moment) {
      const momentData = { ...moment };
      delete momentData.id;
      if (Array.isArray(momentData.images)) {
        momentData.images = JSON.stringify(momentData.images);
      }
      await putRow('Moments', moment.id, momentData);
      return moment;
    },

    async updateMoment(id, patch) {
      const current = await getRow('Moments', id);
      if (!current) return null;
      if (current.images && typeof current.images === 'string') {
        try {
          current.images = JSON.parse(current.images);
        } catch {
          current.images = [];
        }
      }
      const merged = { ...current, ...patch };
      const momentData = { ...merged };
      delete momentData.id;
      if (Array.isArray(momentData.images)) {
        momentData.images = JSON.stringify(momentData.images);
      }
      await putRow('Moments', id, momentData);
      return merged;
    },

    async deleteMoment(id) {
      await deleteRow('Moments', id);
      return true;
    },

    async listTimeline() {
      const rows = await scanTable('Timeline');
      const timeline = rows.map((t) => {
        if (t.photos && typeof t.photos === 'string') {
          try {
            t.photos = JSON.parse(t.photos);
          } catch {
            t.photos = [];
          }
        }
        return t;
      });
      return timeline.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },

    async createTimeline(item) {
      const itemData = { ...item };
      delete itemData.id;
      if (Array.isArray(itemData.photos)) {
        itemData.photos = JSON.stringify(itemData.photos);
      }
      await putRow('Timeline', item.id, itemData);
      return item;
    },

    async updateTimeline(id, patch) {
      const current = await getRow('Timeline', id);
      if (!current) return null;
      if (current.photos && typeof current.photos === 'string') {
        try {
          current.photos = JSON.parse(current.photos);
        } catch {
          current.photos = [];
        }
      }
      const merged = { ...current, ...patch };
      const itemData = { ...merged };
      delete itemData.id;
      if (Array.isArray(itemData.photos)) {
        itemData.photos = JSON.stringify(itemData.photos);
      }
      await putRow('Timeline', id, itemData);
      return merged;
    },

    async deleteTimeline(id) {
      await deleteRow('Timeline', id);
      return true;
    },

    async listPhotoWall() {
      const photos = await scanTable('PhotoWall');
      return photos.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },

    async createPhotoWallPhoto(photo) {
      const photoData = { ...photo };
      delete photoData.id;
      await putRow('PhotoWall', photo.id, photoData);
      return photo;
    },

    async updatePhotoWallPhoto(id, patch) {
      const current = await getRow('PhotoWall', id);
      if (!current) return null;
      const merged = { ...current, ...patch };
      const photoData = { ...merged };
      delete photoData.id;
      await putRow('PhotoWall', id, photoData);
      return merged;
    },

    async deletePhotoWallPhoto(id) {
      await deleteRow('PhotoWall', id);
      return true;
    },

    async createEditor(editor) {
      const data = { ...editor };
      delete data.id;
      await putRow('Editors', editor.id, data);
      return editor;
    },

    async getEditor(id) {
      return await getRow('Editors', id);
    },

    async listEditors() {
      return await scanTable('Editors');
    },

    async revokeEditor(id, revokedAt) {
      const editor = await this.getEditor(id);
      if (!editor) return null;
      editor.status = 'revoked';
      editor.revokedAt = revokedAt;
      const data = { ...editor };
      delete data.id;
      await putRow('Editors', id, data);
      return editor;
    },

    async createInvite(invite) {
      const data = { ...invite };
      delete data.id;
      await putRow('InviteCodes', invite.id, data);
      return invite;
    },

    async listInvites() {
      return await scanTable('InviteCodes');
    },

    async findUnusedInviteByHash(codeHash) {
      const invites = await this.listInvites();
      return invites.find((inv) => inv.codeHash === codeHash && inv.status === 'unused') ?? null;
    },

    async updateInvite(id, patch) {
      const current = await getRow('InviteCodes', id);
      if (!current) return null;
      const merged = { ...current, ...patch };
      const data = { ...merged };
      delete data.id;
      await putRow('InviteCodes', id, data);
      return merged;
    }
  };
}
