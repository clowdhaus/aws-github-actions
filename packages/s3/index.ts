import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet: string = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
