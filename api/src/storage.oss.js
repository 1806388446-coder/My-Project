import OSS from 'ali-oss';
import crypto from 'node:crypto';

export function createLocalPhotoStorage() {
  return {
    async savePhoto({ filename, dataUrl }) {
      const ext = filename.split('.').pop() || 'jpg';
      const randomId = crypto.randomBytes(8).toString('hex');
      return {
        key: `local/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${randomId}.${ext}`,
        url: dataUrl,
        width: null,
        height: null,
        size: dataUrl.length
      };
    },
    async deletePhoto() {
      return true;
    }
  };
}

export function createOSSPhotoStorage({ region, accessKeyId, accessKeySecret, bucket }) {
  const client = new OSS({
    region: region, // e.g. 'oss-cn-hongkong'
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: bucket
  });

  return {
    async savePhoto({ filename, dataUrl }) {
      // dataUrl 格式类似: "data:image/jpeg;base64,/9j/4AAQSk..."
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error('无效的 DataURL 图片数据');
      }
      const contentType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const ext = filename.split('.').pop() || 'jpg';
      const randomId = crypto.randomBytes(8).toString('hex');
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const key = `uploads/${year}/${month}/${randomId}.${ext}`;

      // 上传到 OSS
      await client.put(key, buffer, {
        mime: contentType,
        headers: {
          'Cache-Control': 'max-age=31536000'
        }
      });

      // 获取公开访问的 URL
      // 如果 Bucket 已经是公共读权限，直接拼接 URL 即可
      const url = `https://${bucket}.${region}.aliyuncs.com/${key}`;

      return {
        key,
        url,
        width: null,
        height: null,
        size: buffer.length
      };
    },
    async deletePhoto(key) {
      try {
        await client.delete(key);
        return true;
      } catch (err) {
        console.error('删除云端 OSS 照片失败:', err);
        return false;
      }
    }
  };
}
