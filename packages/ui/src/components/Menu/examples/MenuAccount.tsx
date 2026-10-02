import { ChevronDown, FolderKanban, LogOut, Settings, Shield, User } from 'lucide-react';
import { Button } from '../../Button';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../Menu';

export default function MenuAccount() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="secondary" trailingIcon={ChevronDown} />}>Account</MenuTrigger>
      <MenuContent className="w-60">
        <MenuGroup>
          <MenuGroupLabel>Account</MenuGroupLabel>
          <MenuItem icon={User}>Profile</MenuItem>
          <MenuItem icon={Settings} shortcut="⌘,">
            Preferences
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuGroupLabel>Workspace</MenuGroupLabel>
          <MenuSub>
            <MenuSubTrigger icon={FolderKanban}>Switch workspace</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Personal</MenuItem>
              <MenuItem>Design team</MenuItem>
              <MenuItem>Platform</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem icon={Shield}>Access policies</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem icon={LogOut} destructive>
          Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
