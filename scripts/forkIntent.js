/*
** Fork un seul intent d'un bot vers un autre
*/

import _ from 'lodash'
import Helper from '../helpers/helper'
import Recastapi from '../helpers/recastapi'
import token from '../config/token'

/*
** const source -> account config, le bot contenant l'intent
** l'intent a fork ->
**    source.intent = 'je-suis-la'
*/
const source = { ...token.sfr }
source.intent = 'je-suis-la'

/*
** const target -> account config, le bot recevant l'intent
** l'intent recevant les expressions ->
**    source.target = 'fork-je-suis-la'
*/
const target = { ...token.fork_intent }
target.intent = 'allo'

export default class Script extends Helper {
  constructor () {
    super()
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      // check if the target intent exist
      this.log(`*** check if intent '${target.intent}' exist in bot '${target.bot}'`)
      if (await this.target.isIntent(target.intent) > -1) {
        this.exit(`intent '${target.intent}' already exist in bot '${target.bot}'`)
      }

      // check if the source intent exist
      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        this.exit(`intent '${source.intent}' doesn't exist in bot '${source.bot}'`)
      }

      // get expressions from source
      this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
      source.expressions = (await this.source.getExpressions(source.intent)).expressions

      this.json(source.expressions)

      // build expressions list for request
      const newExpressions = []
      _.forEach(source.expressions, value => {
        const expression = {
          source: value.source,
          language: {
            isocode: value.language.isocode,
          },
        }
        newExpressions.push(expression)
      })

      this.log(`*** create intent '${target.intent}' in bot '${target.bot}' with ${source.expressions.length} expressions`)
      await this.target.addIntent(target.intent, newExpressions)

      this.exit('fork intent done')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }
}
(new Script()).start()
