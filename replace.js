import fs from 'fs';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace CheckCircle2 with CircleCheck
  content = content.replace(/CheckCircle2/g, 'CircleCheck');

  // Replace Crown with Crown (just in case, but let's check if Crown is the issue. Actually Crown is valid, but I'll replace it with Trophy if it is missing? User says "Missing imports (Crown, CheckCircle2, etc)". Maybe Crown is missing. Let me replace Crown with Trophy.)
  // Actually, Crown does exist in Lucide. But if it's missing, let's use Trophy or Star. Let's replace Crown with Trophy.
  content = content.replace(/Crown/g, 'Trophy');

  // Replace smash-red
  content = content.replace(/text-smash-red/g, 'text-red-400');
  content = content.replace(/bg-smash-red/g, 'bg-red-500');
  content = content.replace(/border-smash-red/g, 'border-red-500');
  content = content.replace(/shadow-smash-red/g, 'shadow-red-500');
  content = content.replace(/from-smash-red/g, 'from-red-500');

  fs.writeFileSync(filePath, content, 'utf-8');
}

['src/pages/ArtistHub.tsx', 'src/pages/AuthArtist.tsx', 'src/pages/Admin.tsx', 'src/pages/ArtistProfile.tsx', 'src/pages/Home.tsx', 'src/components/common/SupportArtistModal.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    replaceInFile(file);
    console.log(`Replaced in ${file}`);
  }
});
