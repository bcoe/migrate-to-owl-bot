const {readFileSync, writeFileSync} = require('fs')
const glob = require('glob')

const googleapisPath = '/Users/bencoe/.repo/googleapis-gen'

const API_MAPPING = {
  transcoder: {
    path: 'video/transcoder',
    hint: 'video-transcoder'
  },
  bigqueryconnection: {
    path: 'bigquery/connection',
    hint: 'bigquery-connection'
  }
};

// Generate the copy directives:
try {
  const metadata = JSON.parse(readFileSync('.repo-metadata.json', 'utf8'))
  let api = metadata.api_id;
  // We have an API ID, which we can use as a starting point:
  if (api) {
    let hint = api.split('.')[0];
    let path = hint;
    if (API_MAPPING[hint]) {
      path = API_MAPPING[hint].path;
      hint = API_MAPPING[hint].hint;
    }
    const srcPath = `${googleapisPath}/google/cloud/${path}/*/${hint}-*-nodejs/src/**`;
    const protoPath = `${googleapisPath}/google/cloud/${path}/*/${hint}-*-nodejs/protos/google/cloud/${path}/**`
    const unit = `${googleapisPath}/google/cloud/${path}/*/${hint}-*-nodejs/test/**`
    const system = `${googleapisPath}/google/cloud/${path}/*/${hint}-*-nodejs/system-test/**`

    // We have enough information to generate a .OwlBot.yaml
    if (glob.sync(srcPath).length && glob.sync(protoPath).length && glob.sync(unit).length && glob.sync(system).length) {
      let tmpl = readFileSync(require.resolve('./.OwlBot.yaml.template'), 'utf8')
      tmpl = tmpl.replace(/{hint}/g, hint)
      tmpl = tmpl.replace(/{path}/g, path)
      writeFileSync('.github/.OwlBot.yaml', tmpl, 'utf8')
    } else {
      console.info('not found', hint)
    }
  }
} catch (err) {
  if (err.code !== 'ENOENT') throw err
  else console.warn('no .repo-metadata.json found')
}

// Generate a minimal owlbot.py, this may needed to be edited in some cases:
{
  const synth = readFileSync('synth.py', 'utf8');
  const match = synth.match(/default_version\W*=\W*['"]([^'"]+)/)
  let defaultVersion = ''
  if (match) {
    defaultVersion = `,\n    default_version='${match[1]}'`
  }
  let tmpl = readFileSync(require.resolve('./owlbot.py.tmpl'), 'utf8')
  tmpl = tmpl.replace(/{default_version}/g, defaultVersion)
  writeFileSync('owlbot.py', tmpl, 'utf8')
}

// Populate an initial lock file:
{
  const tmpl = readFileSync(require.resolve('./.OwlBot.lock.yaml'), 'utf8')
  writeFileSync('.github/.OwlBot.lock.yaml', tmpl, 'utf8')
}
