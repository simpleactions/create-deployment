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
    const autoMerge = core.getInput('auto_merge') === 'true'
    const transientEnvironment =
      core.getInput('transient_environment') === 'true'
    const productionEnvironment =
      core.getInput('production_environment') === 'true'
    const requiredContexts = (core.getInput('required_contexts') || '')
      .split(';')
      .map(c => c.trim())
      .filter(c => c !== '')

    const request = await octokit.repos.createDeployment({
      ...context.repo,
      ref,
      task,
      // eslint-disable-next-line @typescript-eslint/camelcase
      auto_merge: autoMerge,
      environment,
      description,
      // eslint-disable-next-line @typescript-eslint/camelcase
      transient_environment: transientEnvironment,
      // eslint-disable-next-line @typescript-eslint/camelcase
      production_environment: productionEnvironment,
      // eslint-disable-next-line @typescript-eslint/camelcase
      required_contexts: requiredContexts,
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
