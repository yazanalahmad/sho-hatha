import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  resources: {
    en: {
      translation: {
        setup: {
          title: 'Sho Hatha?',
          subtitle: 'Who knows more?',
          team1Label: 'Team 1 Name',
          team2Label: 'Team 2 Name',
          timerLabel: 'Timer Duration',
          categoriesPerTeamLabel: 'Categories Per Team',
          startButton: 'Start Game',
          validation: {
            teamNameRequired: 'Please enter a name for both teams',
            timerRequired: 'Please select a timer duration',
          },
        },
        categories: {
          title: 'Choose Categories',
          startButton: "Let's Play!",
          loading: 'Loading categories...',
          generating: 'Generating your game...',
          error: 'Could not load categories. Please try again.',
          networkError: "Can't reach the server. Is it running?",
          serverError: 'Something went wrong. Please try again.',
          insufficientQuestions: 'Not enough questions for these categories.',
          empty: 'No categories are available right now.',
          retry: 'Retry',
          cancel: 'Cancel',
        },
        game: {
          question: 'Question {{current}} of {{total}}',
          turn: "{{team}}'s Turn",
          aids: { fiftyFifty: '50/50', skip: 'Skip', freeze: 'Freeze' },
          feedback: {
            correct: 'Correct! +{{points}} pts',
            wrong: 'Wrong!',
            timeUp: "Time's Up!",
            correctAnswer: 'Correct answer: {{answer}}',
          },
          next: 'Next Question',
          finish: 'Finish',
          noOne: 'No one',
          frozen: 'FROZEN',
        },
        results: {
          winner: '{{team}} Wins!',
          tie: "It's a Tie!",
          finalScore: 'Final Score',
          playAgain: 'Play Again',
        },
      },
    },
    ar: {
      translation: {
        setup: {
          title: 'شو هاظ',
          subtitle: 'مين بيعرف أكثر؟',
          team1Label: 'اسم الفريق الأول',
          team2Label: 'اسم الفريق الثاني',
          timerLabel: 'مدة المؤقت',
          categoriesPerTeamLabel: 'عدد الفئات لكل فريق',
          startButton: 'ابدأ اللعبة',
          validation: {
            teamNameRequired: 'يرجى إدخال اسم لكلا الفريقين',
            timerRequired: 'يرجى اختيار مدة المؤقت',
          },
        },
        categories: {
          title: 'اختر الفئات',
          startButton: 'لنلعب!',
          loading: 'جاري تحميل الفئات...',
          generating: 'جاري تجهيز اللعبة...',
          error: 'تعذر تحميل الفئات. حاول مرة أخرى.',
          networkError: 'تعذر الوصول للخادم. هل هو يعمل؟',
          serverError: 'حدث خطأ. حاول مرة أخرى.',
          insufficientQuestions: 'لا توجد أسئلة كافية لهذه الفئات.',
          empty: 'لا توجد فئات متاحة الآن.',
          retry: 'إعادة المحاولة',
          cancel: 'إلغاء',
        },
        game: {
          question: 'السؤال {{current}} من {{total}}',
          turn: 'دور {{team}}',
          aids: { fiftyFifty: '50/50', skip: 'تخطي', freeze: 'تجميد' },
          feedback: {
            correct: 'إجابة صحيحة! +{{points}} نقطة',
            wrong: 'إجابة خاطئة!',
            timeUp: 'انتهى الوقت!',
            correctAnswer: 'الإجابة الصحيحة: {{answer}}',
          },
          next: 'السؤال التالي',
          finish: 'إنهاء',
          noOne: 'لا أحد',
          frozen: 'مُجمَّد',
        },
        results: {
          winner: '{{team}} يفوز!',
          tie: 'تعادل!',
          finalScore: 'النتيجة النهائية',
          playAgain: 'العب مرة أخرى',
        },
      },
    },
  },
  initImmediate: false,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.title = lng === 'ar' ? 'شو هاظ' : 'Sho Hatha?';
});

void i18n.changeLanguage('en');

export default i18n;
