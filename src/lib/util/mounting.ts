import { WebComponent } from '../component';
import { WebComponentBase } from '../base';
import { wait } from '../shared';

function waitForMountedCallback(el: WebComponentBase): Promise<() => void> {
	const realEl = el as WebComponent;
	return new Promise<() => void>(async (resolve) => {
		if (realEl.mounted) {
			resolve(realEl.mounted);
		} else {
			await wait(50);
			await waitForMountedCallback(el);
			resolve(realEl.mounted);
		}
	});
}

export async function awaitMounted(el: WebComponentBase) {
	const realEl = el as WebComponent;
	if (realEl.isMounted) {
		return;
	}
	await new Promise(async (resolve) => {
		const originalMounted = realEl.mounted ?
			realEl.mounted.bind(realEl) : await waitForMountedCallback(realEl);
		realEl.mounted = () => {
			originalMounted && originalMounted();
			resolve();
		}
	});
}

export async function hookIntoMount(el: WebComponentBase, fn: () => void) {
	const realEl = el as WebComponent;
	if (realEl.isMounted) {
		fn();
		return;
	}
	await new Promise(async (resolve) => {
		const originalMounted = realEl.mounted ?
			realEl.mounted.bind(realEl) : await waitForMountedCallback(realEl);
		realEl.mounted = () => {
			fn();
			originalMounted && originalMounted();
			resolve();
		}
	});
}