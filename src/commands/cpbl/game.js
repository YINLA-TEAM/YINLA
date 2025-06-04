const { SlashCommandBuilder, MessageFlags, ThumbnailBuilder,
        ContainerBuilder, TextDisplayBuilder, SeparatorSpacingSize,
        SectionBuilder, } = require('discord.js');
const cheerio = require('cheerio');
const { teamIcon, gameType } = require('../../data/cpblType.js');

const fetchCPBLPlayer = async(acnt) => {
    if(acnt === undefined) return;
    const response = await fetch(`https://www.cpbl.com.tw/team/person?Acnt=${acnt}`, { method: 'GET'});
    const data = await response.text();
    const $ = cheerio.load(data);

    const playerData = [];

    $('.PlayerBrief').each((i, elem) => {
        const image_regex = /\((.*?)\)/;
        const url = $(elem).find('.img span').attr('style').match(image_regex);

        playerData.push({
            imageURL: url[1],
        })
    })

    return playerData;
}

const fetchCPBLGame = async(game_number, game_year, game_type) => {
    try {
        const response = await fetch(`https://www.cpbl.com.tw/box/getlive?year=${game_year}&kindCode=${game_type}&gameSno=${game_number}`, { method: 'POST' });
        const data = await response.json();
        const game = JSON.parse(data.CurtGameDetailJson); 
        const game_Scoreboard = JSON.parse(data.ScoreboardJson); // 計分表

        const VisitingScoreboard = {};
        const HomeScoreboard = {};

        let VisitingScoreArray = [];
        let VisitingTotalScore = 0;
        let VisitingTotalHitting = 0;
        let VisitingTotalError = 0;

        let HomeScoreArray = [];
        let HomeTotalScore = 0;
        let HomeTotalHitting = 0;
        let HomeTotalError = 0;

        game_Scoreboard.forEach((inning) => {
            if (inning.VisitingHomeType === '1') {
                if (!VisitingScoreboard[inning.InningSeq]) {
                    VisitingScoreboard[inning.InningSeq] = {
                        ScoreCnt: 0,
                        HittingCnt: 0,
                        ErrorCnt: 0
                    };
                }
                VisitingScoreArray.unshift(inning.ScoreCnt);
                VisitingScoreboard[inning.InningSeq].ScoreCnt += inning.ScoreCnt;
                VisitingScoreboard[inning.InningSeq].HittingCnt += inning.HittingCnt;
                VisitingScoreboard[inning.InningSeq].ErrorCnt += inning.ErrorCnt;
                
                VisitingTotalScore += inning.ScoreCnt;
                VisitingTotalHitting += inning.HittingCnt;
                VisitingTotalError += inning.ErrorCnt;
            } else {
                if (!HomeScoreboard[inning.InningSeq]) {
                    HomeScoreboard[inning.InningSeq] = {
                        ScoreCnt: 0,
                        HittingCnt: 0,
                        ErrorCnt: 0
                    };
                }
                HomeScoreArray.unshift(inning.ScoreCnt);
                HomeScoreboard[inning.InningSeq].ScoreCnt += inning.ScoreCnt;
                HomeScoreboard[inning.InningSeq].HittingCnt += inning.HittingCnt;
                HomeScoreboard[inning.InningSeq].ErrorCnt += inning.ErrorCnt;
                
                HomeTotalScore += inning.ScoreCnt;
                HomeTotalHitting += inning.HittingCnt;
                HomeTotalError += inning.ErrorCnt;
            }
        });
        
        return {
            // 賽事資訊
            gameSNo: game?.GameSno,                     //賽事編號
            gameStatus: game?.GameStatus,               //賽事狀態
            gameType: game?.KindCode,
            gameDuringTime: game?.GameDuringTime,
            gameAudience_cnt: game?.AudienceCnt,
            gameAudienceIsFull: game?.IsFull,
            gameTimeS: new Date(game?.GameDateTimeS),
            gameTimeE: new Date(game?.GameDateTimeE),
            gameField: game?.FieldAbbe,
            gameFieldNo: game?.FieldNo,

            // 主客隊資料數據
            awayTeam: game?.VisitingTeamName,            //客隊隊名
            homeTeam: game?.HomeTeamName,                //主隊隊名
            awayScore: game?.VisitingTotalScore == null ? '0' : game?.VisitingTotalScore,         //客隊分數
            homeScore: game?.HomeTotalScore == null ? '0' : game?.HomeTotalScore,             //主隊分數
            awayTeam_code: game?.VisitingTeamCode,
            homeTeam_code: game?.HomeTeamCode,
            awayTeam_W: game?.VisitingGameResultWCnt,
            awayTeam_L: game?.VisitingGameResultLCnt,
            awayTeam_T: game?.VisitingGameResultTCnt,
            homeTeam_W: game?.HomeGameResultWCnt,
            homeTeam_L: game?.HomeGameResultLCnt,
            homeTeam_T: game?.HomeGameResultTCnt,

            // 場地/時間/局數
            place: game?.FieldAbbe,
            place_time: game?.PreExeDate,
            inning: game?.CurtBatting?.InningSeq,
            inning_top_bot: game?.CurtBatting?.VisitingHomeType,
            schedule: game?.GameStatusChi,

            // 先發投手
            away_sp_name: game?.VisitingFirstMover,
            away_sp_Acnt: game?.VisitingFirstAcnt,
            home_sp_name: game?.HomeFirstMover,
            home_sp_Acnt: game?.HomeFirstAcnt,

            // SBOP數據
            strike_cnt: game?.CurtBatting?.StrikeCnt,
            ball_cnt: game?.CurtBatting?.BallCnt,
            out_cnt: game?.CurtBatting?.OutCnt,
            pitch_cnt: game?.CurtBatting?.PitchCnt,

            // 目前打者
            hitter_no: game?.CurtBatting?.HitterUniformNo,
            hitter_name: game?.CurtBatting?.HitterName,
            hitter_Acnt: game?.CurtBatting?.HitterAcnt,
            hitter_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.VisitingTeamName : game.HomeTeamName,

            // 目前投手
            pitcher_no: game?.CurtBatting?.PitcherUniformNo,
            pitcher_name: game?.CurtBatting?.PitcherName,
            pitcher_Acnt: game?.CurtBatting?.PitcherAcnt,
            pitcher_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.HomeTeamName : game.VisitingTeamName,

            // 勝利投手
            wins_pitcher_name: game?.WinningPitcherName,
            wins_pitcher_cnt: game?.WinningPitcherAcnt,
            wins_pitcher_team: game?.WinningType == 1 ? game.VisitingTeamName : game.HomeTeamName,

            // 敗戰投手
            loses_pitcher_name: game?.LosePitcherName,
            loses_pitcher_Acnt: game?.LosePitcherAcnt,
            loses_pitcher_team: game?.WinningType == 1 ? game.HomeTeamName : game.VisitingTeamName,

            // MVP
            mvp_name: game?.HitterName == '' ? game?.PitcherName : game?.HitterName,
            mvp_Acnt: game?.HitterAcnt == '' ? game?.PitcherAcnt : game?.HitterAcnt,
            mvp_cnt: game?.MvpCnt,

            // 打者MVP
            hit_cnt: game?.HitCnt,
            runBattedIn_cnt: game?.RunBattedInCnt,
            score_cnt: game?.ScoreCnt,
            hitting_cnt: game?.HittingCnt,
            homerun_cnt: game?.HomeRunCnt,

            // 投手MVP
            inningPitched_cnt: game?.InningPitchedCnt,
            inningPitchedDiv3_cnt: game?.InningPitchedDiv3Cnt,
            strikeOut_cnt: game?.StrikeOutCnt,
            run_cnt: game?.RunCnt,

            // 裁判
            headUmpire: game?.HeadUmpire,
            oneBaseReferee: game?.OneBaseReferee,
            twoBaseReferee: game?.TwoBaseReferee,
            threeBaseReferee: game?.TrheeBaseReferee, // idk why this is wrong, this is api's wrong name
            leftFieldReferee: game?.LeftFieldReferee == '' ? "無" : game?.LeftFieldReferee,
            rightFieldReferee: game?.RightFieldReferee == '' ? "無" : game?.RightFieldReferee,

            VisitingScoreArray,
            VisitingTotalScore,
            VisitingTotalHitting,
            VisitingTotalError,
            HomeScoreArray,
            HomeTotalScore,
            HomeTotalHitting,
            HomeTotalError
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}

const msToHMS = (ms) => {
        let seconds = ms / 1000; 
        const hours = parseInt( seconds / 3600 ); 
        seconds = seconds % 3600; 
        const minutes = parseInt( seconds / 60 ); 
        seconds = seconds % 60; 
        return(`${hours}:${minutes}:${~~(seconds)}`);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_game')
        .setNameLocalizations({
            "zh-TW" : "中華職棒賽事",
        })
        .setDescription("查詢賽事詳細資訊")
        .addIntegerOption(option => (
            option
                .setName('game_year')
                .setNameLocalizations({
                    "zh-TW" : "比賽年份",
                })
                .setDescription("年份範圍：1990~至今")
                .setRequired(true)
                .setMinValue(1990)
                .setMaxValue(new Date().getFullYear())
        ))
        .addIntegerOption(option => (
            option
                .setName('game_number')
                .setNameLocalizations({
                    "zh-TW" : "比賽編號",
                })
                .setDescription("請輸入有效的比賽編號")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(360)
        ))
        .addStringOption(option => (
            option
                .setName("game_type")
                .setNameLocalizations({
                    "zh-TW": "賽事類型",
                })
                .setDescription("一軍例行賽、一軍明星賽、一軍總冠軍賽、二軍例行賽、一軍季後挑戰賽、二軍總冠軍賽、一軍熱身賽")
                .setRequired(true)
                .addChoices(
                    { name: '一軍例行賽', value: 'A' },
                    { name: '一軍熱身賽', value: 'G' },
                    { name: '一軍明星賽', value: 'B' },
                    { name: '一軍季後挑戰賽', value: 'E' },
                    { name: '一軍總冠軍賽', value: 'C' },
                    { name: '二軍例行賽', value: 'D' },
                    { name: '二軍總冠軍賽', value: 'F' },
                )
        )),

    async execute (interaction) {
        await interaction.deferReply({
            withResponse: true,
            flags: MessageFlags.Ephemeral,
        });

        let game_number = interaction.options.getInteger('game_number');
        let game_year = interaction.options.getInteger('game_year');
        let game_type = interaction.options.getString('game_type');

        const game = await fetchCPBLGame(game_number, game_year, game_type);

        let player = null;

        if (!game || game.gameStatus === 1 || game.gameStatus === 6 || game.gameStatus === 5) {
            // 如果比賽尚未開始
            await interaction.editReply(`## 🚨：\`${game_year}\`年，\`${gameType(game_type)}\` 編號 \`${game_number}\` 尚未開始或無數據`);
            return;
        }

        let innings = Array.from({ length: game.VisitingScoreArray.length }, (_, i) => i + 1);

        const CPBLogo = new TextDisplayBuilder()
            .setContent([
                `# <:cpbl_logo:1275836738304217181> 中華職棒大聯盟`
            ].join('\n'));

        const CPBLheader = new TextDisplayBuilder()
            .setContent([
                `## ${teamIcon(game.awayTeam)} ${game.awayTeam} vs. ${teamIcon(game.homeTeam)} ${game.homeTeam}`
            ].join('\n'));

        const CPBLScoreboard = new TextDisplayBuilder()
            .setContent([
                `### <:cpbl_logo:1275836738304217181> ${innings.map(i => `\`${i}\``).join(' ')} | \`R\` \`H\` \`E\`\n` +
                `### ${teamIcon(game.awayTeam)} ${game.VisitingScoreArray.map(s => `\`${s}\``).join(' ')} | \`${game.VisitingTotalScore}\` \`${game.VisitingTotalHitting}\` \`${game.VisitingTotalError}\`\n` +
                `### ${teamIcon(game.homeTeam)} ${game.HomeScoreArray.map(s => `\`${s}\``).join(' ')} | \`${game.HomeTotalScore}\` \`${game.HomeTotalHitting}\` \`${game.HomeTotalError}\``
            ].join('\n'));

        const CPBLReferee = new TextDisplayBuilder()
            .setContent([
                `- **主審**： ${game.headUmpire == '' ? "無" : game.headUmpire}`,
                `- **一壘審**： ${game.oneBaseReferee == '' ? "無" : game.oneBaseReferee}`,
                `- **二壘審**： ${game.twoBaseReferee == '' ? "無" : game.twoBaseReferee}`,
                `- **三壘審**： ${game.threeBaseReferee == '' ? "無" : game.threeBaseReferee}`,
                `- **左線審**： ${game.leftFieldReferee == '' ? "無" : game.leftFieldReferee}`,
                `- **右線審**： ${game.rightFieldReferee == '' ? "無" : game.rightFieldReferee}`,
            ].join('\n'));

        const CPBLGameDetail = new TextDisplayBuilder()
            .setContent([
                `- **賽事時間**： <t:${game.gameTimeS.getTime() / 1000}>`,
                `- **賽事結束時間**： <t:${game.gameTimeE.getTime() / 1000}>`,
                `- **花費時間**： ${msToHMS((game.gameTimeE.getTime()) - (game.gameTimeS.getTime()))}`,
                ``,
                `-# ${game.place}棒球場 • ${gameType(game.gameType)} • 編號 ${game.gameSNo}`,
            ].join('\n'));

        const CPBLGameMVPheader = new TextDisplayBuilder()
            .setContent([
                `## MVP 最有價值球員`,
                `### ${teamIcon(game.wins_pitcher_team)} [${game.mvp_name}](https://www.cpbl.com.tw/team/person?acnt=${game.mvp_Acnt})`
            ].join('\n'));

        const CPBLGameMVPDescription = new TextDisplayBuilder()
            .setContent([
                `- **當年度獲選MVP次數**： ${game.mvp_cnt}`,
            ].join('\n'));
        
        if(game.hit_cnt !== null){
            CPBLGameMVPDescription
            .setContent([
                `- **打數**： ${game.hit_cnt}`,
                `- **打點**： ${game.runBattedIn_cnt}`,
                `- **得分**： ${game.score_cnt}`,
                `- **安打**： ${game.hitting_cnt}`,
                `- **全壘打**： ${game.homerun_cnt}`
            ].join('\n'));
        } else {
            CPBLGameMVPDescription
            .setContent([
                `- **投球局數**： ${game.inningPitched_cnt}`,
                `- **奪三振數**： ${game.strikeOut_cnt}`,
                `- **失分數**： ${game.run_cnt}`
            ].join('\n'));
        }

        player = await fetchCPBLPlayer(game.mvp_Acnt);
        const CPBLGameMVPAvatar = new ThumbnailBuilder()
        const CPBLGameMVP = new SectionBuilder()

        if (game.mvp_name !== '') {
            CPBLGameMVPAvatar.setURL(player[0].imageURL === undefined ? "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png" : `https://www.cpbl.com.tw${player[0].imageURL}`)
            CPBLGameMVP
                .setThumbnailAccessory(CPBLGameMVPAvatar)
                .addTextDisplayComponents(CPBLGameMVPheader)
                .addTextDisplayComponents(CPBLGameMVPDescription)
        }

        const CPBLContainer = new ContainerBuilder()
            .addTextDisplayComponents(CPBLogo)
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(CPBLheader)
            .addTextDisplayComponents(CPBLScoreboard)
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))

        if(game.mvp_name !== '') CPBLContainer.addSectionComponents(CPBLGameMVP);
        
        CPBLContainer
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(CPBLReferee)
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(CPBLGameDetail);

        await interaction.editReply({
            components : [ CPBLContainer ],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}