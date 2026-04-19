import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TeamInput } from '../components/setup/TeamInput';
import { TimerSelector } from '../components/setup/TimerSelector';
import { PageFrame } from '../components/shared/PageFrame';
import { PageTransition } from '../components/shared/PageTransition';
import { useGameContext } from '../hooks/useGameContext';

const timerOptions = [15, 30, 45, 60, 90, 120];
const categoriesPerTeamOptions: Array<2 | 3 | 4 | 5> = [2, 3, 4, 5];

export function SetupPage() {
  const { t } = useTranslation();
  const { dispatch } = useGameContext();
  const navigate = useNavigate();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [categoriesPerTeam, setCategoriesPerTeam] = useState<2 | 3 | 4 | 5>(3);
  const [errors, setErrors] = useState<{ teams?: string; timer?: string }>({});

  const onSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!team1Name.trim() || !team2Name.trim()) {
      nextErrors.teams = t('setup.validation.teamNameRequired');
    }
    if (!timerDuration) {
      nextErrors.timer = t('setup.validation.timerRequired');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !timerDuration) {
      return;
    }

    dispatch({
      type: 'START_SETUP',
      team1Name: team1Name.trim(),
      team2Name: team2Name.trim(),
      timerDuration,
      categoriesPerTeam,
    });
    navigate('/categories');
  };

  return (
    <PageFrame>
      <PageTransition transitionKey="setup">
        <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <hr className="gold-divider" />
          <div className="py-6 text-center">
            <h1 className="text-[clamp(4rem,10vw,6rem)] text-gold">🏆 {t('setup.title')} 🏆</h1>
            <p className="text-gold-muted text-xl">{t('setup.subtitle')}</p>
          </div>
        </motion.div>

        <motion.div
          className="card p-6 space-y-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <TeamInput label={t('setup.team1Label')} value={team1Name} onChange={setTeam1Name} error={errors.teams} />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <TeamInput label={t('setup.team2Label')} value={team2Name} onChange={setTeam2Name} error={errors.teams} />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <p className="font-display text-xl text-gold mb-2">{t('setup.timerLabel')}</p>
            <TimerSelector options={timerOptions} selected={timerDuration} onSelect={setTimerDuration} />
            {errors.timer ? <p className="text-wrong text-sm mt-1">{errors.timer}</p> : null}
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <p className="font-display text-xl text-gold mb-2">{t('setup.categoriesPerTeamLabel')}</p>
            <TimerSelector options={categoriesPerTeamOptions} selected={categoriesPerTeam} onSelect={(value) => setCategoriesPerTeam(value as 2 | 3 | 4 | 5)} />
          </motion.div>

          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <button type="button" className="w-full bg-gold text-bg-base font-display text-3xl py-3" onClick={onSubmit}>
              {t('setup.startButton')} →
            </button>
          </motion.div>
        </motion.div>

        <hr className="gold-divider" />
      </PageTransition>
    </PageFrame>
  );
}
