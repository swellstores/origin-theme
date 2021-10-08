import postscribe from 'postscribe'

function checkScriptTag(content) {
  if (!content.match('<script>')) {
    return `<script>${content}</script>`
  }
  return content
}

export default function ({ $swell }) {
  postscribe(
    document.head,
    checkScriptTag($swell.settings.get('scripts.global.head'))
  )
  postscribe(
    document.body,
    checkScriptTag($swell.settings.get('scripts.global.body'))
  )
}
