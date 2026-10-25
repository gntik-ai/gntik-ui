import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Button } from '../../Button';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../../Combobox';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../Drawer';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../../Menu';
import { SimpleSelect } from '../../Select';
import { ToastProvider, Toaster, useToast } from '../../Toast';
import { SimpleTooltip } from '../../Tooltip';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog';

function ModalControls() {
  const { t } = useI18n();
  const toast = useToast();
  const options = [t('layers.first'), t('layers.second')];
  return (
    <div className="grid gap-4">
      <SimpleSelect label={t('layers.select')} items={options.map((label) => ({ value: label, label }))} />
      <Combobox items={options}>
        <ComboboxInput label={t('layers.search')} />
        <ComboboxContent>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" />}>{t('layers.actions')}</MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => toast.add({ title: t('layers.saved') })}>{t('layers.notify')}</MenuItem>
        </MenuContent>
      </Menu>
      <Button onClick={() => toast.add({ title: t('layers.saved') })}>{t('layers.notify')}</Button>
      <SimpleTooltip content={t('layers.tooltip')} delay={0}>
        <Button variant="ghost">{t('layers.hint')}</Button>
      </SimpleTooltip>
      <Dialog>
        <DialogTrigger render={<Button variant="secondary" />}>{t('layers.openNested')}</DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t('layers.nested')}</DialogTitle>
            <DialogDescription>{t('layers.description')}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Launchers() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button />}>{t('layers.openDialog')}</DialogTrigger>
        <Menu>
          <MenuTrigger render={<Button variant="secondary" />}>{t('layers.actions')}</MenuTrigger>
          <MenuContent>
            <MenuItem onClick={() => setOpen(true)}>{t('layers.openDialog')}</MenuItem>
          </MenuContent>
        </Menu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('layers.dialog')}</DialogTitle>
            <DialogDescription>{t('layers.description')}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ModalControls />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger render={<Button variant="secondary" />}>{t('layers.openDrawer')}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('layers.drawer')}</DrawerTitle>
            <DrawerDescription>{t('layers.description')}</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <ModalControls />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/** The toaster mounts before either modal, just as it does in an application shell. */
export default function LayeredOverlays() {
  return (
    <ToastProvider timeout={0}>
      <Toaster />
      <Launchers />
    </ToastProvider>
  );
}
