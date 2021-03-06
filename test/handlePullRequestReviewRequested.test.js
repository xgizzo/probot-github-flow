const handlePullRequestReviewRequested = require('../lib/handlePullRequestReviewRequested')
const { REVIEW_REQUESTED } = require('../lib/utils/constants')

const owner = 'owner'
const repo = 'repo'
const number = '1234'
const pullRequest = {
  body: `Closes #${number}`,
  merged: true,
  number: '5678'
}
const github = {}

jest.mock('../lib/utils/labels', () => ({
  addLabels: jest.fn()
}))

const { addLabels } = require('../lib/utils/labels')

beforeEach(() => {
  addLabels.mockReset()
})

test('labels with REVIEW_REQUESTED', async () => {
  await handlePullRequestReviewRequested(github, owner, repo, {
    pull_request: pullRequest
  })

  expect(addLabels).toBeCalledWith(github, owner, repo, number, [
    REVIEW_REQUESTED
  ])
})
