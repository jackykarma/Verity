/**
 * FEAT-005 预设文案：性格 × 互动类型 × 情绪（plan A3.2.4）
 * 键：firstMeet[npcId] | remember[personalityType][interactionType][emotionTag]
 */

export const firstMeet = {
  teacher: '你好呀，我是林老师。今天也要开心哦～',
  bestfriend: '嘿！你来啦，我们一起玩吧！',
  classmate: '……哼，你谁啊。',
  animal: '（小动物蹭了蹭你）'
};

/** 再次见面「记得我」文案：personalityType -> interactionType -> emotionTag -> 文案 */
export const remember = {
  gentle: {
    talk: { happy: '林老师记得你上次聊得很开心呢。', grateful: '上次和你聊天，老师很开心。', calm: '今天也想和你聊聊。', expectant: '期待再和你说话呀。' },
    help: { happy: '谢谢你上次帮忙，老师记得哦。', grateful: '你上次帮的忙，老师一直记得。', calm: '你是个乐于助人的孩子。', expectant: '下次也拜托你啦。' },
    play: { happy: '上次一起玩得很开心，下次再一起吧。', grateful: '和你一起玩老师很开心。', calm: '和你在一起很放松。', expectant: '还想再和你玩游戏呢。' }
  },
  clingy: {
    talk: { happy: '你上次和我说话我可开心了！还记得吗？', grateful: '你对我真好，我都记得！', calm: '和你聊天就很安心～', expectant: '你终于又来啦！' },
    help: { happy: '你帮我的那件事我一直记着！', grateful: '谢谢你帮我，你最好啦！', calm: '有你帮忙我就放心。', expectant: '下次还要你帮我！' },
    play: { happy: '上次玩得超开心！我们再来！', grateful: '和你玩最开心了！', calm: '和你一起玩就很开心。', expectant: '快再和我玩嘛！' }
  },
  tsundere: {
    talk: { happy: '……上次聊得还行吧。才不是高兴呢。', grateful: '……谢、谢啦。我可没忘。', calm: '……嗯。', expectant: '……你又来了啊。' },
    help: { happy: '……你帮我的事，我记着呢。别得意。', grateful: '……谢了。就、就那样吧。', calm: '……帮大忙了。', expectant: '……下次还能帮我吗。' },
    play: { happy: '……上次玩得还行。再来一次也不是不行。', grateful: '……和你玩还不赖。', calm: '……嗯，下次再玩。', expectant: '……还玩不玩了？' }
  }
};
