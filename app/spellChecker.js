/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports.addWord = (session, word) => {
  if (session) {
    session.spellChecker.addWord(word)
  }
}

module.exports.removeWord = (session, word) => {
  if (session) {
    session.spellChecker.removeWord(word)
  }
}
