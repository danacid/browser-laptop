/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const appConstants = require('../../../js/constants/appConstants')
const {makeImmutable} = require('../../common/state/immutableUtil')
const {getWebContents} = require('../webContentsCache')
const spellChecker = require('../../spellChecker')

const migrate = (state) => {
  if (state.get('dictionary')) {
    const addedWords = state.getIn(['dictionary', 'addedWords'])
    const ignoredWords = state.getIn(['dictionary', 'ignoredWords'])
    if (addedWords.size) {
      addedWords.forEach((word) => {
        spellChecker.addWord(word)
      })
      state = state.setIn(['legacyDictionary', 'addedWords'], addedWords)
      state = state.deleteIn(['dictionary', 'addedWords'])
    }
    if (ignoredWords.size) {
      ignoredWords.forEach((word) => {
        spellChecker.addWord(word)
      })
      state = state.setIn(['legacyDictionary', 'ignoredWords'], ignoredWords)
      state = state.deleteIn(['dictionary', 'ignoredWords'])
    }
    state = state.delete('dictionary')
  }
  return state
}

const spellCheckerReducer = (state, action, immutableAction) => {
  action = immutableAction || makeImmutable(action)
  switch (action.get('actionType')) {
    case appConstants.APP_SET_STATE:
      state = migrate(state)
      break
    case appConstants.APP_SPELLING_SUGGESTED:
      if (typeof action.suggestion === 'string') {
        const webContents = getWebContents(action.tabId)
        if (webContents && !webContents.isDestroyed()) {
          webContents.replaceMisspelling(action.suggestion)
        }
      }
      break
    case appConstants.APP_LEARN_SPELLING:
      if (typeof action.word === 'string') {
        spellChecker.addWord(action.word)
        const webContents = getWebContents(action.tabId)
        if (webContents && !webContents.isDestroyed()) {
          webContents.replaceMisspelling(action.word)
        }
      }
      break
    case appConstants.APP_FORGET_LEARNED_SPELLING:
      if (typeof action.word === 'string') {
        spellChecker.removeWord(action.word)
        const webContents = getWebContents(action.tabId)
        if (webContents && !webContents.isDestroyed()) {
          webContents.replace(action.word)
        }
      }
  }
  return state
}

module.exports = spellCheckerReducer
