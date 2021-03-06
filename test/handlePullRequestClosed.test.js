const handlePullRequestClosed = require('../lib/handlePullRequestClosed')
const {
  IN_PROGRESS,
  READY_FOR_REVIEW,
  REVIEW_REQUESTED,
  REJECTED
} = require('../lib/utils/constants')

const owner = 'owner'
const repo = 'repo'
const number = '1234'
const pullRequest = {
  body: `Closes #${number}`,
  merged: true,
  number: '5678',
  head: {
    ref: 'my-branch'
  }
}

const github = {
  issues: {
    get: jest.fn(),
    edit: jest.fn()
  },
  gitdata: {
    deleteReference: jest.fn()
  },
  pullRequests: {
    getAll: jest.fn()
  }
}

jest.mock('../lib/utils/labels', () => ({
  removeLabels: jest.fn()
}))

const { removeLabels } = require('../lib/utils/labels')

beforeEach(() => {
  removeLabels.mockReset()
  github.issues.get.mockReset()
  github.issues.edit.mockReset()
  github.pullRequests.getAll.mockReset()
})

it('closes issues, removes labels and deletes branch', async () => {
  github.issues.get.mockReturnValue({
    data: {
    }
  })

  github.pullRequests.getAll.mockReturnValue({ data: [] })

  await handlePullRequestClosed(github, owner, repo, {
    pull_request: pullRequest
  })

  expect(github.gitdata.deleteReference).toBeCalledWith({
    owner,
    repo,
    ref: `heads/${pullRequest.head.ref}`
  })

  const labels = [IN_PROGRESS, READY_FOR_REVIEW, REVIEW_REQUESTED, REJECTED]

  expect(removeLabels).toBeCalledWith(github, owner, repo, number, labels)

  expect(github.issues.get).toBeCalledWith({
    owner,
    repo,
    number
  })
})

xit('does not delete pull request', async () => {
  github.issues.get.mockReturnValue({
    data: {
      body: `**PR:** #${pullRequest.number}`
    }
  })

  github.pullRequests.getAll.mockReturnValue({ data: [{ number: '5678' }] })

  await handlePullRequestClosed(github, owner, repo, {
    pull_request: pullRequest
  })

  expect(github.gitdata.deleteReference).not.toBeCalled()
})
