import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { openUrl, profile, socials } from "./data";
import s from "./Projects.module.css";
import r from "./Resume.module.css";

/** CV in the inset-grouped style of Settings. */
export function Resume() {
  return (
    <>
      <div className={r.profile}>
        <Avatar name={profile.name} size={88} />
        <h2>{profile.name}</h2>
        <p>{profile.title}</p>
        <span>
          <Icon name="location" size={14} /> {profile.location}
        </span>
      </div>
      <Section header="Hakkımda">
        <p className={s.para}>{profile.about}</p>
      </Section>
      <Section header="Deneyim">
        <ol className={r.timeline}>
          {profile.experience.map(job => (
            <li key={job.company}>
              <b>{job.role}</b>
              <span>{job.company} · {job.period}</span>
              <p>{job.summary}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section header="Yetenekler">
        {profile.skills.map(skill => (
          <Row
            key={skill.name}
            label={
              <span className={r.skill}>
                {skill.name}
                <span className={r.meter} role="meter" aria-label={skill.name} aria-valuenow={skill.value} aria-valuemin={0} aria-valuemax={100}>
                  <i style={{ width: `${skill.value}%` }} />
                </span>
              </span>
            }
            detail={skill.value}
          />
        ))}
      </Section>
      <Section header="Eğitim">
        {profile.education.map(e => (
          <Row key={e.school} label={e.school} sub={e.degree} detail={e.period} />
        ))}
      </Section>
      <Section header="Diller">
        {profile.languages.map(l => (
          <Row key={l.name} label={l.name} detail={l.level} />
        ))}
      </Section>
      <Section header="İletişim">
        {socials.map(link => (
          <Row
            key={link.id}
            label={link.label}
            icon={link.icon}
            iconColor="var(--purple)"
            detail={link.handle}
            onClick={link.url === "#" ? undefined : () => openUrl(link.url)}
          />
        ))}
      </Section>
    </>
  );
}
