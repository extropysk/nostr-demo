export function normalizeURL(rawUrl: string) {
  const url = new URL(rawUrl)
  return (
    url.host +
    url.pathname
      .replace(/\/+/g, '/') // remove duplicated slashes in the middle of the path
      .replace(/\/*$/, '') // remove slashes from the end of path
  )
}
