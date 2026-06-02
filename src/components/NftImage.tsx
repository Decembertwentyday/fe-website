// ============================================================================
// 【NftImage】铭文内容自适应渲染组件
// ----------------------------------------------------------------------------
// 铭文内容（content 字段）有三种格式，分别渲染方式不同：
//   1. data:text/html  → <iframe sandbox="allow-scripts">（支持交互式 HTML 铭文）
//      sandbox 限制：允许脚本但禁止弹窗、第三方请求等（安全隔离）
//   2. data:image/...  → <img>，像素化渲染（imageRendering: 'pixelated'）
//      适合像素风格 NFT （防模糊）
//   3. 其他       → <img src=content>（直接当 URL 用）
// ============================================================================

'use client';

interface INftImage {
  content: string;
}

const NftImage: React.FC<INftImage> = ({ content }) => {
  function getContentView() {
    if (content.includes('data:text/html')) {
      return (
        <iframe
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            border: 'none',
            outline: 'none',
            verticalAlign: 'middle',
            aspectRatio: '1/1',
            overflow: 'hidden',
          }}
          src={content}
          sandbox="allow-scripts"
        />
      );
    }

    if (content.includes('data:image')) {
      return (
        <img
          alt="Landscape picture"
          src={content}
          height="100%"
          width="100%"
          style={{
            objectFit: 'contain',
            border: 'none',
            outline: 'none',
            imageRendering: 'pixelated',
          }}
        />
      );
    }

    return (
      <img
        src={content}
        height="100%"
        width="100%"
        style={{
          objectFit: 'contain',
          border: 'none',
          outline: 'none',
          imageRendering: 'pixelated',
        }}
      />
    );
  }

  return getContentView();
};

export default NftImage;
