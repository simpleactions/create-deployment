import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token = (core.getInput('github_token') ||
      process.env.GITHUB_TOKEN) as string

    const octokit = new github.GitHub(token)
    const context = github.context

    const ref = core.getInput('ref') || context.ref
    const description = core.getInput('description')
    const environment = core.getInput('environment')
    const task = core.getInput('task') || 'deploy'
    const auto_merge = core.getInput('auto_merge') === 'true'
    const transient_environment =
      core.getInput('transient_environment') === 'true'
    const production_environment =
      core.getInput('production_environment') === 'true'
    const required_contexts = (core.getInput('required_contexts') || '')
      .split(';')
      .map(c => c.trim())
      .filter(c => c !== '')

    const request = await octokit.repos.createDeployment({
      ...context.repo,
      ref,
      task,
      auto_merge,
      environment,
      description,
      transient_environment,
      production_environment,
      required_contexts,
      mediaType: {
        previews: [
          'ant-man-preview' // https://developer.github.com/v3/previews/#enhanced-deployments
        ]
      }
    })

    const deployment = request.data
    core.setOutput('deployment_id', deployment.id.toString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
