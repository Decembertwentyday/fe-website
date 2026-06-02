// ============================================================================
// 【EthsView】铭文内容渲染组件（三种格式分支）
// ----------------------------------------------------------------------------
// 根据 category + isJson + isHtml 决定渲染方式：
//   - token 或 text+json  → <pre>，JSON 格式化显示（如 BRC-20 content）
//   - domain 或 text+非 json/html → 纯文本展示（如 .eth 域名）
//   - nft 或 text+html  → <iframe>，渲染 HTML/图片内容
// 注意：isJsonView 和 isTextView 可同时为真，分别渲染各自内容
// ============================================================================
import { Box } from '@mui/material';

interface IEthsView {
  category: string;
  data: string;
  isJson: boolean;
  isHtml: boolean;
}

const EthsView: React.FC<IEthsView> = ({ category, data, isJson, isHtml }) => {
  const isJsonView = category === 'token' || (category === 'text' && isJson);
  const isTextView = category === 'domain' || (category === 'text' && !isJson && !isHtml);

  return (
    <>
      {isJsonView && (
        <Box
          sx={{
            width: '100%',
          }}
        >
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflowX: 'auto',
              fontSize: '14px',
              paddingLeft: '30px',
              paddingRight: '25px',
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {data}
          </pre>
        </Box>
      )}
      {category === 'image' && !isHtml && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%', width: '100%' }}>
          <img
            width="100%"
            height="100%"
            style={{
              objectFit: 'contain',
              border: 'none',
              outline: 'none',
              imageRendering: 'pixelated',
            }}
            src={data}
            alt="data"
          />
        </Box>
      )}
      {isHtml && (
        <Box display="flex" justifyContent="center" alignItems="center">
          <iframe
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
            loading="lazy"
            src={data}
          ></iframe>
        </Box>
      )}
      {isTextView && (
        <Box
          sx={{
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '15px',
            px: '10px',
            width: '100%',
            wordBreak: 'break-all',
          }}
        >
          {data}
        </Box>
      )}
    </>
  );
};

export default EthsView;
