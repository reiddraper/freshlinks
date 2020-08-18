import {relative} from 'path'
import {closest, distance} from 'fastest-levenshtein'

export function suggestPath(
  sourceFile: string,
  badLink: string,
  candidatePaths: string[]
): [string, number] {
  const relativePathCandidates = candidatePaths.map(path => {
    const relativeLink = relative(sourceFile, path)
    // the relative links calculated will have an extra `../`,
    // if the directory is 'above', or the file is in the same
    // directory as the current file. So if this relative path
    // starts with a `../`, we remove one layer of it
    if (relativeLink.startsWith('../')) {
      return relativeLink.slice(3)
    } else {
      return relativeLink
    }
  })
  // Don't include a link to the sourceFile itself
  const withoutSelfLink = relativePathCandidates.filter(link => {
    return link !== ''
  })
  const match = closest(badLink, withoutSelfLink)
  return [match, distance(badLink, match)]
}

// A constant that can be used to only suggest
// paths that are 'close enough' to the incorrect path
export const SUGGEST_MIN_DISTANCE = 8
