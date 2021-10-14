import postscribe from 'postscribe'

function checkScriptTag(content) {
  if (content && !content.match('<script>')) {
    return `<script>${content}</script>`
  }
  return content
}

export default function ({ $swell }) {
  const headScripts = $swell.settings.get('scripts.global.head')
  const bodyScripts = $swell.settings.get('scripts.global.body')

  if (headScripts && typeof headScripts === 'string') {
    postscribe(document.head, checkScriptTag(headScripts))
  }

  if (bodyScripts && typeof bodyScripts === 'string') {
    postscribe(document.body, checkScriptTag(bodyScripts))
  }
}
