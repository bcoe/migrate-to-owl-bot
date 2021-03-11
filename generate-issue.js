const {readdirSync} = require('fs');
const repos = readdirSync('/Users/bencoe/.repo').sort()

for (const repo of repos) {
  console.info(`\n**${repo}:**\n`)
  console.info(`- [ ] .OwlBot.lock generated`)
  console.info(`- [ ] .OwlBot.yaml generated`)
  console.info(`- [ ] owlbot.py generated`)
}
